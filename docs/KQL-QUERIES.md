# KQL Query Library for Order Processing System

## Overview Queries

### All Order Events (Last Hour)
```kql
customEvents
| where timestamp > ago(1h)
| where name in ("OrderSubmitted", "OrderProcessed", "OrderProcessingFailed")
| project timestamp, name, orderId = tostring(customDimensions.orderId),
          customerId = tostring(customDimensions.customerId),
          correlationId = tostring(customDimensions.correlationId)
| order by timestamp desc
```

### Order Processing Rate
```kql
customEvents
| where timestamp > ago(24h)
| where name == "OrderProcessed"
| summarize OrdersProcessed = count() by bin(timestamp, 1h)
| render timechart
```

### Order Submission vs Processing
```kql
customEvents
| where timestamp > ago(24h)
| where name in ("OrderSubmitted", "OrderProcessed")
| summarize count() by name, bin(timestamp, 1h)
| render timechart
```

## Performance Queries

### Average Order Processing Duration
```kql
customMetrics
| where timestamp > ago(24h)
| where name == "OrderProcessingDuration"
| summarize avg(value), percentile(value, 50), percentile(value, 95), percentile(value, 99) by bin(timestamp, 5m)
| render timechart
```

### Processing Duration by Status
```kql
customMetrics
| where timestamp > ago(24h)
| where name == "OrderProcessingDuration"
| extend status = tostring(customDimensions.status)
| summarize avg(value) by status, bin(timestamp, 1h)
| render timechart
```

### Slowest Orders
```kql
customMetrics
| where timestamp > ago(24h)
| where name == "OrderProcessingDuration"
| extend orderId = tostring(customDimensions.orderId)
| top 20 by value desc
| project timestamp, orderId, DurationMs = value
```

### Message Queue Age
```kql
customMetrics
| where timestamp > ago(24h)
| where name == "MessageQueueAge"
| summarize avg(value), max(value), percentile(value, 95) by bin(timestamp, 5m)
| render timechart
```

## Error and Failure Queries

### All Exceptions
```kql
exceptions
| where timestamp > ago(24h)
| extend orderId = tostring(customDimensions.orderId),
         correlationId = tostring(customDimensions.correlationId)
| project timestamp, type, outerMessage, orderId, correlationId
| order by timestamp desc
```

### Failed Orders
```kql
customEvents
| where timestamp > ago(24h)
| where name == "OrderProcessingFailed"
| extend orderId = tostring(customDimensions.orderId),
         error = tostring(customDimensions.error),
         deliveryCount = toint(customDimensions.deliveryCount)
| project timestamp, orderId, error, deliveryCount
| order by timestamp desc
```

### Error Rate Over Time
```kql
customEvents
| where timestamp > ago(24h)
| where name in ("OrderProcessed", "OrderProcessingFailed")
| summarize Total = count(),
            Failed = countif(name == "OrderProcessingFailed")
| extend ErrorRate = (Failed * 100.0) / Total
| project ErrorRate, Total, Failed
```

### Errors by Type
```kql
exceptions
| where timestamp > ago(24h)
| summarize Count = count() by type
| order by Count desc
| render piechart
```

## Dependency Queries

### Dependency Performance
```kql
dependencies
| where timestamp > ago(24h)
| summarize avg(duration), percentile(duration, 95), count() by name, type
| order by avg_duration desc
```

### Failed Dependencies
```kql
dependencies
| where timestamp > ago(24h)
| where success == false
| extend orderId = tostring(customDimensions.orderId)
| project timestamp, name, type, data, duration, orderId
| order by timestamp desc
```

### Service Bus Dependency Tracking
```kql
dependencies
| where timestamp > ago(24h)
| where type == "Azure Service Bus"
| summarize avg(duration), count(), FailureRate = countif(success == false) * 100.0 / count()
  by bin(timestamp, 5m)
| render timechart
```

### Payment Gateway Performance
```kql
dependencies
| where timestamp > ago(24h)
| where name == "PaymentGateway"
| summarize avg(duration), percentile(duration, 95),
            SuccessRate = countif(success == true) * 100.0 / count()
  by bin(timestamp, 15m)
| render timechart
```

## Business Metrics Queries

### Order Value Distribution
```kql
customMetrics
| where timestamp > ago(24h)
| where name == "OrderTotalAmount"
| extend currency = tostring(customDimensions.currency)
| summarize TotalRevenue = sum(value),
            AvgOrderValue = avg(value),
            OrderCount = count()
  by currency
```

### Revenue Over Time
```kql
customMetrics
| where timestamp > ago(7d)
| where name == "OrderValue"
| where tostring(customDimensions.status) == "Completed"
| extend currency = tostring(customDimensions.currency)
| summarize Revenue = sum(value) by bin(timestamp, 1h), currency
| render timechart
```

### Top Customers by Order Count
```kql
customEvents
| where timestamp > ago(30d)
| where name == "OrderSubmitted"
| extend customerId = tostring(customDimensions.customerId)
| summarize OrderCount = count(),
            TotalAmount = sum(todouble(customDimensions.totalAmount))
  by customerId
| top 10 by OrderCount desc
```

## Distributed Tracing Queries

### End-to-End Transaction by Correlation ID
```kql
let correlationId = "your-correlation-id-here";
union requests, dependencies, customEvents, traces, exceptions
| where timestamp > ago(1d)
| where customDimensions.correlationId == correlationId
| project timestamp, itemType, name, duration, success, message = iff(itemType == "trace", message, "")
| order by timestamp asc
```

### Orders with Full Trace
```kql
let orderId = "your-order-id-here";
union customEvents, dependencies, traces, exceptions
| where timestamp > ago(7d)
| where customDimensions.orderId == orderId
| project timestamp,
          type = itemType,
          name,
          details = coalesce(message, tostring(customDimensions))
| order by timestamp asc
```

## Alerting Queries

### High Error Rate (Threshold: 5%)
```kql
customEvents
| where timestamp > ago(5m)
| where name in ("OrderProcessed", "OrderProcessingFailed")
| summarize Total = count(),
            Failed = countif(name == "OrderProcessingFailed")
| extend ErrorRate = (Failed * 100.0) / Total
| where ErrorRate > 5
```

### Slow Processing (Threshold: 30 seconds)
```kql
customMetrics
| where timestamp > ago(5m)
| where name == "OrderProcessingDuration"
| where value > 30000
| summarize SlowOrders = count()
| where SlowOrders > 0
```

### Dead Letter Queue Messages
```kql
customEvents
| where timestamp > ago(5m)
| where name == "OrderDeadLettered"
| summarize DeadLetterCount = count()
| where DeadLetterCount > 0
```

### Dependency Failures
```kql
dependencies
| where timestamp > ago(5m)
| where success == false
| summarize FailureCount = count() by name
| where FailureCount > 3
```

## Operational Queries

### Function Execution Summary
```kql
requests
| where timestamp > ago(1h)
| summarize RequestCount = count(),
            AvgDuration = avg(duration),
            SuccessRate = countif(success == true) * 100.0 / count()
  by name
| order by RequestCount desc
```

### Queue Depth Monitoring
```kql
customMetrics
| where timestamp > ago(1h)
| where name == "MessageQueueAge"
| summarize avg(value), max(value) by bin(timestamp, 1m)
| where max_value > 60000  // Messages older than 1 minute
| render timechart
```

### Duplicate Detection
```kql
customEvents
| where timestamp > ago(24h)
| where name == "OrderDuplicateDetected"
| extend orderId = tostring(customDimensions.orderId)
| summarize DuplicateCount = count() by orderId
| order by DuplicateCount desc
```

## Dashboard Queries

### Real-Time Dashboard (5-minute window)
```kql
let timeRange = 5m;
customEvents
| where timestamp > ago(timeRange)
| where name in ("OrderSubmitted", "OrderProcessed", "OrderProcessingFailed")
| summarize
    Submitted = countif(name == "OrderSubmitted"),
    Processed = countif(name == "OrderProcessed"),
    Failed = countif(name == "OrderProcessingFailed")
| extend SuccessRate = (Processed * 100.0) / Submitted
```

### Hourly Processing Summary
```kql
customEvents
| where timestamp > ago(24h)
| where name in ("OrderSubmitted", "OrderProcessed", "OrderProcessingFailed")
| summarize
    Submitted = countif(name == "OrderSubmitted"),
    Processed = countif(name == "OrderProcessed"),
    Failed = countif(name == "OrderProcessingFailed")
  by bin(timestamp, 1h)
| extend SuccessRate = round((Processed * 100.0) / Submitted, 2)
| order by timestamp desc
```

## Troubleshooting Queries

### Recent Errors with Context
```kql
exceptions
| where timestamp > ago(1h)
| extend orderId = tostring(customDimensions.orderId),
         correlationId = tostring(customDimensions.correlationId),
         functionName = tostring(customDimensions.functionName)
| project timestamp, functionName, type, message, orderId, correlationId, details
| order by timestamp desc
| take 50
```

### Service Bus Send Failures
```kql
dependencies
| where timestamp > ago(1h)
| where type == "Azure Service Bus"
| where success == false
| extend orderId = tostring(customDimensions.orderId),
         error = tostring(customDimensions.error)
| project timestamp, name, data, duration, orderId, error
| order by timestamp desc
```

### Payment Processing Issues
```kql
dependencies
| where timestamp > ago(24h)
| where name == "PaymentGateway"
| where success == false
| extend orderId = tostring(customDimensions.orderId),
         amount = tostring(customDimensions.amount),
         error = tostring(customDimensions.error)
| project timestamp, orderId, amount, error, duration
| order by timestamp desc
```

### Inventory Check Failures
```kql
dependencies
| where timestamp > ago(24h)
| where name == "InventoryService"
| where success == false
| extend orderId = tostring(customDimensions.orderId),
         error = tostring(customDimensions.error)
| project timestamp, data, orderId, error, duration
| order by timestamp desc
```
