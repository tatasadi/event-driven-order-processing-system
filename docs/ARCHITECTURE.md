# Architecture Documentation

## Overview

This system implements an event-driven architecture for processing e-commerce orders using Azure services.

## Architecture Pattern

**Pattern:** Queue-Based Load Leveling + Competing Consumers

### Benefits

1. **Decoupling:** Frontend and processing are independent
2. **Reliability:** Messages are persisted in Service Bus
3. **Scalability:** Multiple consumers can process messages in parallel
4. **Resilience:** Failed messages go to dead letter queue
5. **Performance:** Fast response to users, async processing

## Components

### 1. Next.js Frontend
- **Purpose:** User interface for order submission
- **Tech:** Next.js 15, TypeScript, TailwindCSS
- **Hosting:** Azure Static Web Apps

### 2. Order Submission Function (HTTP Trigger)
- **Purpose:** Receive and validate orders, publish to queue
- **Tech:** Azure Functions v4, TypeScript
- **Trigger:** HTTP POST /api/orders
- **Actions:**
  - Validate order data (Zod schema)
  - Generate unique order ID
  - Publish to Service Bus queue
  - Return 201 Created with order ID

### 3. Service Bus Queue
- **Purpose:** Reliable message broker
- **Configuration:**
  - Max delivery count: 10
  - Lock duration: 5 minutes
  - TTL: 14 days
  - Dead letter queue: Enabled
  - Duplicate detection: 10 minutes

### 4. Order Processor Function (Queue Trigger)
- **Purpose:** Process orders asynchronously
- **Tech:** Azure Functions v4, TypeScript
- **Trigger:** Service Bus queue message
- **Actions:**
  - Deserialize message
  - Validate order
  - Process order (inventory check, payment, etc.)
  - Update order status
  - Log to Application Insights

### 5. Application Insights
- **Purpose:** Monitoring, logging, diagnostics
- **Metrics:**
  - Request rates
  - Response times
  - Exception rates
  - Custom events (OrderSubmitted, OrderProcessed, etc.)
  - Queue depth

## Data Flow

1. User submits order via Next.js form
2. Frontend calls HTTP Function (`POST /api/orders`)
3. HTTP Function validates and publishes to Service Bus queue
4. HTTP Function returns 201 with order ID
5. Queue Function triggers on new message
6. Queue Function processes order
7. All steps logged to Application Insights

## Message Schema

### Order Message

```typescript
interface Order {
  orderId: string;              // UUID v4
  customerId: string;           // Customer identifier
  customerEmail: string;        // For notifications
  items: OrderItem[];           // Line items
  totalAmount: number;          // Total in currency units
  currency: string;             // ISO 4217 (e.g., "EUR")
  orderDate: string;            // ISO 8601 timestamp
  status: OrderStatus;          // submitted | processing | completed | failed
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;                // Unit price
}

enum OrderStatus {
  Submitted = 'submitted',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed'
}
``` 

## Error Handling

### HTTP Function
- **400 Bad Request:** Invalid order data
- **500 Internal Server Error:** Service Bus unavailable
- **503 Service Unavailable:** Temporary failures

### Queue Function
- **Transient Errors:** Automatic retry (up to 10 times)
- **Permanent Errors:** Move to dead letter queue
- **Poison Messages:** Detected after max delivery count

## Scalability

### Horizontal Scaling
- Multiple HTTP Function instances (Azure manages)
- Multiple Queue Function instances (competing consumers)
- Service Bus supports high message throughput

### Limits
- Service Bus Standard: 256 KB message size
- Functions Consumption Plan: Auto-scale based on queue depth
- Application Insights: 1M events/month (free tier)

## Security

1. **HTTPS Only:** All communication encrypted
2. **Connection Strings:** Stored in Key Vault (production)
3. **Managed Identity:** Functions access Service Bus without keys
4. **CORS:** Restricted to frontend domain
5. **Input Validation:** All data validated before processing

## Monitoring

### Key Metrics
- Order submission rate
- Order processing rate
- Processing duration
- Error rate
- Queue depth

### Alerts
- High error rate (> 5%)
- Slow processing (> 30 seconds)
- Dead letter queue messages
- Exception spikes

## Future Enhancements

- [ ] Add Cosmos DB for order persistence
- [ ] Implement Azure SignalR for real-time updates
- [ ] Add Azure API Management
- [ ] Implement circuit breaker pattern
- [ ] Add rate limiting
- [ ] Implement saga pattern for complex workflows
