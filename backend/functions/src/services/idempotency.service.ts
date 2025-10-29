import { InvocationContext } from '@azure/functions'
import { Logger } from '../utils/logger'

/**
 * Simple in-memory idempotency service
 * In production, use Azure Cosmos DB, Redis, or Table Storage
 */
export class IdempotencyService {
	private processedOrders: Set<string> = new Set()
	private readonly ttlMs: number = 10 * 60 * 1000 // 10 minutes
	private orderTimestamps: Map<string, number> = new Map()

	/**
	 * Check if an order has already been processed
	 */
	isProcessed(orderId: string, context: InvocationContext): boolean {
		const logger = new Logger(context)
		const isProcessed = this.processedOrders.has(orderId)

		if (isProcessed) {
			logger.warn('Order has already been processed (idempotent)', {
				orderId,
			})
		}

		return isProcessed
	}

	/**
	 * Mark an order as processed
	 */
	markAsProcessed(orderId: string, context: InvocationContext): void {
		const logger = new Logger(context)
		this.processedOrders.add(orderId)
		this.orderTimestamps.set(orderId, Date.now())
		logger.info('Order marked as processed', { orderId })

		// Clean up old entries
		this.cleanup()
	}

	/**
	 * Clean up old processed orders based on TTL
	 */
	private cleanup(): void {
		const now = Date.now()

		for (const [orderId, timestamp] of this.orderTimestamps.entries()) {
			if (now - timestamp > this.ttlMs) {
				this.processedOrders.delete(orderId)
				this.orderTimestamps.delete(orderId)
			}
		}
	}
}

// Singleton instance
export const idempotencyService = new IdempotencyService()
