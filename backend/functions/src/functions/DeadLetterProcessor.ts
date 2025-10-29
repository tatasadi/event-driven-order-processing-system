import { app, InvocationContext, Timer } from '@azure/functions'
import { ServiceBusClient } from '@azure/service-bus'
import { Order } from '../models/order.types'
import { Logger } from '../utils/logger'

/**
 * Timer-triggered function that periodically checks the dead letter queue
 * and logs dead-lettered messages for monitoring and alerting.
 *
 * Note: Dead letter queues cannot be directly subscribed to with a Service Bus trigger.
 * This function runs on a schedule to check for dead-lettered messages.
 *
 * Schedule: Every 5 minutes (adjust as needed)
 */
export async function DeadLetterProcessor(
	_myTimer: Timer,
	context: InvocationContext,
): Promise<void> {
	const logger = new Logger(context)

	logger.info('DeadLetterProcessor function triggered', {
		action: 'checking_dead_letter_queue',
	})

	const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING
	const queueName = 'orders-queue'

	if (!connectionString) {
		logger.error('SERVICE_BUS_CONNECTION_STRING is not configured', new Error('Missing configuration'))
		return
	}

	const sbClient = new ServiceBusClient(connectionString)

	try {
		// Create a receiver for the dead letter queue
		const receiver = sbClient.createReceiver(queueName, {
			subQueueType: 'deadLetter',
		})

		// Peek messages without removing them (for monitoring)
		const messages = await receiver.peekMessages(10)

		if (messages.length === 0) {
			logger.info('No messages in dead letter queue')
		} else {
			logger.warn('Found messages in dead letter queue', {
				messageCount: messages.length,
			})

			for (const message of messages) {
				try {
					const order: Order = message.body as Order

					logger.error('Dead letter queue message found', new Error(message.deadLetterReason || 'Unknown reason'), {
						messageId: message.messageId,
						orderId: order?.orderId,
						customerId: order?.customerId,
						deliveryCount: message.deliveryCount,
						enqueuedTimeUtc: message.enqueuedTimeUtc,
						deadLetterReason: message.deadLetterReason,
						deadLetterErrorDescription: message.deadLetterErrorDescription,
						orderDetails: JSON.stringify(order),
					})

					// In production, you would:
					// 1. Send alert to operations team (e.g., via email/Teams/PagerDuty)
					// 2. Log to monitoring system (already logged via Application Insights)
					// 3. Store in a database for manual review
					// 4. Send notification to customer
					// 5. Create incident ticket (e.g., Jira, ServiceNow)
				} catch (error: any) {
					logger.error('Error processing individual dead letter message', error)
				}
			}
		}

		await receiver.close()
	} catch (error: any) {
		logger.error('Error checking dead letter queue', error)
	} finally {
		await sbClient.close()
	}
}

// Register as a timer-triggered function (runs every 5 minutes)
// You can adjust the schedule as needed: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer
app.timer('DeadLetterProcessor', {
	// Schedule: Every 5 minutes
	schedule: '0 0 * * * *',
	handler: DeadLetterProcessor,
})
