import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus'
import { Order } from '../models/order.types'

export class ServiceBusService {
	private client: ServiceBusClient
	private sender: ServiceBusSender

	constructor(connectionString: string, queueName: string) {
		this.client = new ServiceBusClient(connectionString)
		this.sender = this.client.createSender(queueName)
	}

	async sendOrder(order: Order): Promise<void> {
		try {
			const message = {
				body: order,
				contentType: 'application/json',
				messageId: order.orderId,
				subject: 'order.submitted',
				applicationProperties: {
					orderId: order.orderId,
					customerId: order.customerId,
					totalAmount: order.totalAmount,
					currency: order.currency,
				},
			}

			await this.sender.sendMessages(message)
			console.log(`Order ${order.orderId} sent to Service Bus queue`)
		} catch (error) {
			console.error('Error sending message to Service Bus:', error)
			throw new Error('Failed to send order to queue')
		}
	}

	async close(): Promise<void> {
		await this.sender.close()
		await this.client.close()
	}
}
