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

export async function OrderSubmit(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('OrderSubmit function triggered');

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateOrderSubmission(body);

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
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    };

    // Send to Service Bus
    const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
    const queueName = process.env.SERVICE_BUS_QUEUE_NAME || 'orders';

    if (!connectionString) {
      throw new Error('SERVICE_BUS_CONNECTION_STRING not configured');
    }

    const serviceBusService = new ServiceBusService(
      connectionString,
      queueName
    );

    await serviceBusService.sendOrder(order);
    await serviceBusService.close();

    // Log success
    context.log(`Order ${orderId} successfully submitted`);

    // Return response
    const response: OrderSubmissionResponse = {
      orderId,
      message: 'Order submitted successfully',
      status: OrderStatus.Submitted,
    };

    return {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    context.error('Error processing order:', error);

    // Validation error
    if (error.name === 'ZodError') {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
      };
    }

    // Service error
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process order',
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