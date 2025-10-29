export enum OrderStatus {
	Submitted = 'submitted',
	Processing = 'processing',
	Completed = 'completed',
	Failed = 'failed',
}

export interface OrderItem {
	productId: string
	productName: string
	quantity: number
	price: number // Unit price in currency units
}

export interface Order {
	orderId: string
	customerId: string
	customerEmail: string
	items: OrderItem[]
	totalAmount: number
	currency: string // ISO 4217 (e.g., "EUR", "USD")
	orderDate: string // ISO 8601 timestamp
	status: OrderStatus
	metadata?: {
		correlationId?: string
		ipAddress?: string
		userAgent?: string
		sessionId?: string
	}
}

export interface OrderSubmissionRequest {
	customerId: string
	customerEmail: string
	items: OrderItem[]
	currency?: string
}

export interface OrderSubmissionResponse {
	orderId: string
	message: string
	status: OrderStatus
}
