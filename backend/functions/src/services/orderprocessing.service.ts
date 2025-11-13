import { InvocationContext } from '@azure/functions'
import { Order, OrderStatus } from '../models/order.types'
import { TelemetryService } from './telemetry.service'

export class OrderProcessingService {
	constructor(private telemetry: TelemetryService) {}

	/**
	 * Process an order - implement your business logic here
	 */
	async processOrder(order: Order, context: InvocationContext): Promise<Order> {
		context.log(`Starting to process order: ${order.orderId}`)

		try {
			// Update order status to processing
			order.status = OrderStatus.Processing

			// Step 1: Validate inventory
			await this.validateInventory(order, context)

			// Step 2: Process payment
			await this.processPayment(order, context)

			// Step 3: Reserve inventory
			await this.reserveInventory(order, context)

			// Step 4: Create shipment
			await this.createShipment(order, context)

			// Update order status to completed
			order.status = OrderStatus.Completed
			context.log(`Order ${order.orderId} processed successfully`)

			return order
		} catch (error: any) {
			context.error(`Error processing order ${order.orderId}:`, error)
			order.status = OrderStatus.Failed
			throw error
		}
	}

	/**
	 * Validate inventory availability
	 */
	private async validateInventory(order: Order, context: InvocationContext): Promise<void> {
		const startTime = Date.now()
		context.log(`Validating inventory for order: ${order.orderId}`)

		try {
			await this.simulateDelay(500)

			for (const item of order.items) {
				// In production, check against real inventory system
				const availableQuantity = Math.floor(Math.random() * 100)

				if (availableQuantity < item.quantity) {
					throw new Error(
						`Insufficient inventory for product ${item.productId}. ` +
							`Requested: ${item.quantity}, Available: ${availableQuantity}`,
					)
				}

				context.log(
					`Inventory validated for ${item.productName}: ${item.quantity} units available`
				)
			}

			const duration = Date.now() - startTime
			this.telemetry.trackDependency(
				'Check Inventory',
				'HTTP',
				'POST /api/inventory/check',
				duration,
				true,
				{
					orderId: order.orderId,
					itemCount: order.items.length.toString(),
					service: 'InventoryService',
				}
			)

			this.telemetry.trackMetric('InventoryCheckDuration', duration)
		} catch (error: any) {
			const duration = Date.now() - startTime

			this.telemetry.trackDependency(
				'Check Inventory',
				'HTTP',
				'POST /api/inventory/check',
				duration,
				false,
				{
					orderId: order.orderId,
					error: error.message,
					service: 'InventoryService',
				}
			)

			throw error
		}
	}

	/**
	 * Process payment for the order
	 */
	private async processPayment(order: Order, context: InvocationContext): Promise<void> {
		const startTime = Date.now()
		context.log(`Processing payment for order: ${order.orderId}`)

		try {
			await this.simulateDelay(800)

			// Simulate random payment failures (5% chance)
			if (Math.random() < 0.05) {
				throw new Error(`Payment failed for order ${order.orderId}: Card declined`)
			}

			const duration = Date.now() - startTime

			this.telemetry.trackDependency(
				'Process Payment',
				'HTTP',
				'POST /api/payment/process',
				duration,
				true,
				{
					orderId: order.orderId,
					amount: order.totalAmount.toString(),
					currency: order.currency,
					service: 'PaymentGateway',
				}
			)

			this.telemetry.trackMetric('PaymentProcessingDuration', duration)
			this.telemetry.trackMetric('PaymentAmount', order.totalAmount, {
				currency: order.currency,
			})

			context.log(
				`Payment processed successfully: ${order.totalAmount} ${order.currency}`
			)
		} catch (error: any) {
			const duration = Date.now() - startTime

			this.telemetry.trackDependency(
				'Process Payment',
				'HTTP',
				'POST /api/payment/process',
				duration,
				false,
				{
					orderId: order.orderId,
					amount: order.totalAmount.toString(),
					error: error.message,
					service: 'PaymentGateway',
				}
			)

			throw error
		}
	}

	/**
	 * Reserve inventory items
	 */
	private async reserveInventory(order: Order, context: InvocationContext): Promise<void> {
		const startTime = Date.now()
		await this.simulateDelay(300)

		for (const item of order.items) {
			context.log(
				`Reserved ${item.quantity} units of ${item.productName} (${item.productId})`
			)
		}

		const duration = Date.now() - startTime
		this.telemetry.trackDependency(
			'Reserve Inventory',
			'HTTP',
			'POST /api/inventory/reserve',
			duration,
			true,
			{
				orderId: order.orderId,
				service: 'InventoryService',
			}
		)
	}

	/**
	 * Create shipment for the order
	 */
	private async createShipment(order: Order, context: InvocationContext): Promise<void> {
		const startTime = Date.now()
		await this.simulateDelay(600)

		const trackingNumber = `TRACK-${Date.now()}-${order.orderId.substring(0, 8)}`
		context.log(`Shipment created with tracking number: ${trackingNumber}`)

		const duration = Date.now() - startTime
		this.telemetry.trackDependency(
			'Create Shipment',
			'HTTP',
			'POST /api/shipping/create',
			duration,
			true,
			{
				orderId: order.orderId,
				trackingNumber,
				service: 'ShippingService',
			}
		)

		this.telemetry.trackEvent('ShipmentCreated', {
			orderId: order.orderId,
			trackingNumber,
		})
	}

	/**
	 * Simulate processing delay
	 */
	private async simulateDelay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms))
	}
}
