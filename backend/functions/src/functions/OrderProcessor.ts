import { app, InvocationContext } from '@azure/functions'
import { Order, OrderStatus } from '../models/order.types'
import { OrderProcessingService } from '../services/orderprocessing.service'
import { idempotencyService } from '../services/idempotency.service'
import { TelemetryService } from '../services/telemetry.service'

export async function OrderProcessor(
	message: unknown,
	context: InvocationContext,
): Promise<void> {
	const startTime = Date.now()

	// Parse message body - in Azure Functions v4, the message is already the deserialized body
	const order: Order = message as Order

	// Extract correlation ID from message metadata
	const correlationId = order?.metadata?.correlationId || order?.orderId || 'unknown'
	const telemetry = new TelemetryService(context, correlationId)

	context.log('OrderProcessor function triggered')
	context.log('Message ID:', context.triggerMetadata?.messageId)
	context.log('Delivery count:', context.triggerMetadata?.deliveryCount)
	context.log('Correlation ID:', correlationId)

	telemetry.trackEvent('OrderProcessingStarted', {
		messageId: context.triggerMetadata?.messageId?.toString() || 'unknown',
		deliveryCount: context.triggerMetadata?.deliveryCount?.toString() || '0',
		correlationId,
	})

	try {
		if (!order || !order.orderId) {
			throw new Error('Invalid order message: missing orderId')
		}

		context.log(`Processing order: ${order.orderId}`)
		context.log(`Customer: ${order.customerEmail}`)
		context.log(`Total amount: ${order.totalAmount} ${order.currency}`)
		context.log(`Items count: ${order.items.length}`)

		// Track message age (if enqueuedTimeUtc is available)
		if (context.triggerMetadata?.enqueuedTimeUtc) {
			const messageAge = Date.now() - new Date(context.triggerMetadata.enqueuedTimeUtc as string).getTime()
			telemetry.trackMetric('MessageQueueAge', messageAge, {
				orderId: order.orderId,
			})
		}

		// Check idempotency
		if (idempotencyService.isProcessed(order.orderId, context)) {
			context.warn(`Order ${order.orderId} already processed. Skipping duplicate.`)

			telemetry.trackEvent('OrderDuplicateDetected', {
				orderId: order.orderId,
				correlationId,
				deliveryCount: context.triggerMetadata?.deliveryCount?.toString() || '0',
			})

			await telemetry.flush()
			return
		}

		// Process the order
		const orderProcessingService = new OrderProcessingService(telemetry)
		const processedOrder = await orderProcessingService.processOrder(order, context)

		// Mark as processed for idempotency
		idempotencyService.markAsProcessed(order.orderId, context)

		// Log success metrics
		const duration = Date.now() - startTime

		telemetry.trackEvent('OrderProcessed', {
			orderId: order.orderId,
			customerId: order.customerId,
			totalAmount: order.totalAmount.toString(),
			currency: order.currency,
			itemsCount: order.items.length.toString(),
			status: processedOrder.status,
			correlationId,
		})

		telemetry.trackMetric('OrderProcessingDuration', duration, {
			orderId: order.orderId,
			status: processedOrder.status,
		})

		telemetry.trackMetric('OrderValue', order.totalAmount, {
			currency: order.currency,
			status: processedOrder.status,
		})

		context.log(`Order ${order.orderId} processed successfully in ${duration}ms`)

		await telemetry.flush()
	} catch (error: any) {
		const duration = Date.now() - startTime

		context.error(`Error processing order: ${error.message}`)
		context.error('Error stack:', error.stack)

		telemetry.trackException(error, {
			messageId: context.triggerMetadata?.messageId?.toString() || 'unknown',
			deliveryCount: context.triggerMetadata?.deliveryCount?.toString() || '0',
			correlationId,
			duration: duration.toString(),
		})

		telemetry.trackEvent('OrderProcessingFailed', {
			messageId: context.triggerMetadata?.messageId?.toString() || 'unknown',
			deliveryCount: context.triggerMetadata?.deliveryCount?.toString() || '0',
			error: error.message,
			correlationId,
			duration: duration.toString(),
		})

		telemetry.trackMetric('OrderProcessingError', 1, {
			errorType: error.name || 'Unknown',
		})

		await telemetry.flush()

		// Get message metadata from triggerMetadata
		const deliveryCount = context.triggerMetadata?.deliveryCount as number | undefined

		// Determine if error is transient or permanent
		const isTransient = isTransientError(error)

		if (isTransient && deliveryCount && deliveryCount < 5) {
			context.warn('Transient error detected, message will be retried')
			context.log(`Delivery count: ${deliveryCount}, Error type: transient`)
			throw error // Re-throw to trigger retry
		} else {
			context.error('Permanent error or max retries exceeded, moving to dead letter queue')
			context.log(`Delivery count: ${deliveryCount}, Error type: permanent`)
			throw error // Will go to DLQ after max delivery count
		}
	}
}

/**
 * Determine if an error is transient (should retry) or permanent
 */
function isTransientError(error: any): boolean {
	const errorMessage = error.message || ''

	// Permanent errors - do NOT retry these
	const permanentErrors = [
		'Payment failed',
		'Card declined',
		'Invalid card',
		'Insufficient funds',
		'Invalid order',
		'Validation failed',
	]

	// Check if it's a permanent error first
	if (permanentErrors.some(permError => errorMessage.includes(permError))) {
		return false
	}

	// Transient errors - these should be retried
	const transientErrors = [
		'ETIMEDOUT',
		'ECONNRESET',
		'ENOTFOUND',
		'ECONNREFUSED',
		'ServiceUnavailable',
		'Network error',
		'Timeout',
		'Connection error',
	]

	return transientErrors.some(transientError => errorMessage.includes(transientError))
}

// Register the function
app.serviceBusQueue('OrderProcessor', {
	connection: 'SERVICE_BUS_CONNECTION_STRING',
	queueName: 'orders-queue',
	handler: OrderProcessor,
})
