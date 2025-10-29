import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { validateOrderSubmission } from '../models/order.schemas';
import {
  Order,
  OrderStatus,
  OrderSubmissionResponse,
} from '../models/order.types';
import { ServiceBusService } from '../services/servicebus.service';
import { TelemetryService } from '../services/telemetry.service';
import { getCorrelationId, addCorrelationHeader } from '../utils/correlation';

export async function OrderSubmit(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const startTime = Date.now();

  // Get or generate correlation ID
  const correlationId = getCorrelationId(request, context);
  const telemetry = new TelemetryService(context, correlationId);

  context.log(`OrderSubmit function triggered - Correlation ID: ${correlationId}`);
  telemetry.trackEvent('OrderSubmissionStarted', {
    correlationId,
    method: request.method,
    url: request.url,
  });

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationStart = Date.now();
    const validatedData = validateOrderSubmission(body);
    const validationDuration = Date.now() - validationStart;

    telemetry.trackMetric('OrderValidationDuration', validationDuration);
    telemetry.trackEvent('OrderValidationSucceeded', {
      correlationId,
      customerId: validatedData.customerId,
      itemCount: validatedData.items.length.toString(),
    });

    // Create order object
    const orderId = uuidv4();
    const orderDate = new Date().toISOString();

    // Calculate total amount
    const totalAmount = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order: Order = {
      orderId,
      customerId: validatedData.customerId,
      customerEmail: validatedData.customerEmail,
      items: validatedData.items,
      totalAmount,
      currency: validatedData.currency,
      orderDate,
      status: OrderStatus.Submitted,
      metadata: {
        correlationId,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    };

    context.log(`Order created: ${order.orderId}`);

    // Send to Service Bus
    const serviceBusStart = Date.now();
    const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
    const queueName = process.env.SERVICE_BUS_QUEUE_NAME || 'orders';

    if (!connectionString) {
      throw new Error('SERVICE_BUS_CONNECTION_STRING not configured');
    }

    try {
      const serviceBusService = new ServiceBusService(
        connectionString,
        queueName
      );

      await serviceBusService.sendOrder(order);
      await serviceBusService.close();

      const serviceBusDuration = Date.now() - serviceBusStart;

      telemetry.trackDependency(
        'ServiceBus',
        'Azure Service Bus',
        `Queue: ${queueName}`,
        serviceBusDuration,
        true,
        {
          orderId: order.orderId,
          queueName,
        }
      );

      telemetry.trackMetric('ServiceBusSendDuration', serviceBusDuration, {
        queueName,
      });
    } catch (serviceBusError: any) {
      const serviceBusDuration = Date.now() - serviceBusStart;

      telemetry.trackDependency(
        'ServiceBus',
        'Azure Service Bus',
        `Queue: ${queueName}`,
        serviceBusDuration,
        false,
        {
          orderId: order.orderId,
          error: serviceBusError.message,
        }
      );

      telemetry.trackException(serviceBusError, {
        stage: 'servicebus',
        orderId: order.orderId,
        queueName,
      });

      throw serviceBusError;
    }

    // Track success metrics
    const totalDuration = Date.now() - startTime;

    telemetry.trackEvent('OrderSubmitted', {
      orderId: order.orderId,
      customerId: order.customerId,
      totalAmount: order.totalAmount.toString(),
      currency: order.currency,
      itemCount: order.items.length.toString(),
      correlationId,
    });

    telemetry.trackMetric('OrderSubmissionDuration', totalDuration, {
      orderId: order.orderId,
    });

    telemetry.trackMetric('OrderTotalAmount', order.totalAmount, {
      currency: order.currency,
    });

    // Flush telemetry before returning
    await telemetry.flush();

    context.log(`Order ${order.orderId} submitted successfully`);

    // Return response
    const response: OrderSubmissionResponse = {
      orderId,
      message: 'Order submitted successfully',
      status: OrderStatus.Submitted,
    };

    return {
      status: 201,
      headers: addCorrelationHeader(
        {
          'Content-Type': 'application/json',
          'Location': `/api/orders/${order.orderId}`,
        },
        correlationId
      ),
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;

    context.error('Error in OrderSubmit:', error);

    telemetry.trackException(error, {
      correlationId,
      duration: totalDuration.toString(),
    });

    // Validation error
    if (error.name === 'ZodError') {
      telemetry.trackEvent('OrderValidationFailed', {
        correlationId,
        errors: JSON.stringify(error.errors),
      });

      await telemetry.flush();

      return {
        status: 400,
        headers: addCorrelationHeader(
          { 'Content-Type': 'application/json' },
          correlationId
        ),
        body: JSON.stringify({
          error: 'Validation error',
          details: error.errors,
          correlationId,
        }),
      };
    }

    telemetry.trackEvent('OrderSubmissionFailed', {
      correlationId,
      error: error.message,
      duration: totalDuration.toString(),
    });

    await telemetry.flush();

    // Service error
    return {
      status: 500,
      headers: addCorrelationHeader(
        { 'Content-Type': 'application/json' },
        correlationId
      ),
      body: JSON.stringify({
        error: 'Failed to submit order',
        message: error.message,
        correlationId,
      }),
    };
  }
}

app.http('OrderSubmit', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'orders',
  handler: OrderSubmit,
});