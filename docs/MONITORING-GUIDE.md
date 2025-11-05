# Monitoring Guide

## Quick Access Links

- **Live Metrics Stream**: Azure Portal → Application Insights → Live Metrics
- **Logs**: Azure Portal → Application Insights → Logs
- **Dashboard**: Azure Portal → Dashboards → Order Processing System
- **Alerts**: Azure Portal → Monitor → Alerts
- **Workbooks**: Azure Portal → Application Insights → Workbooks
  - 📘 See [Workbook Setup Guide](./WORKBOOK-SETUP-GUIDE.md) for detailed import instructions

## Key Metrics to Monitor

### System Health
- **Request rate**: orders/minute
- **Error rate**: % of failed orders
- **Average response time**: milliseconds
- **Queue depth**: messages waiting to be processed
- **Message age**: time messages spend in queue

### Business Metrics
- **Orders processed per hour**: throughput measurement
- **Total revenue**: sum of all completed orders
- **Average order value**: revenue per order
- **Failed order count**: orders that couldn't be processed
- **Top customers**: customers with most orders

### Performance Metrics
- **Order submission duration**: time to accept and queue order
- **Order processing duration**: end-to-end processing time
- **Payment processing duration**: payment gateway response time
- **Inventory check duration**: inventory service response time
- **Dependency response times**: external service latencies

### Telemetry Coverage
- **Custom events**: OrderSubmitted, OrderProcessed, OrderProcessingFailed, etc.
- **Custom metrics**: Processing durations, amounts, queue age
- **Dependencies**: Service Bus, Payment Gateway, Inventory Service, Shipping Service
- **Exceptions**: All errors with full context
- **Distributed tracing**: End-to-end tracking via correlation IDs

## Alert Response Procedures

### High Error Rate Alert
**Trigger**: Error rate exceeds 5% over 5 minutes

**Response Steps**:
1. Check Application Insights → Failures tab
2. Identify most common error type and frequency
3. Review recent deployments or configuration changes
4. Check Service Bus dead letter queue for failed messages
5. Review dependencies for failures (Payment, Inventory, etc.)
6. If capacity issue: Scale up Function App
7. If data issue: Review order validation rules
8. If external service issue: Contact service owner

**Investigation Queries**:
```kql
// Recent errors
exceptions
| where timestamp > ago(15m)
| summarize count() by type, outerMessage
| order by count_ desc
```

### Slow Processing Alert
**Trigger**: Orders taking >30 seconds to process, sustained over 5 minutes

**Response Steps**:
1. Check Live Metrics for current bottlenecks
2. Review dependency performance (Payment, Inventory services)
3. Check for database or storage contention
4. Verify Service Bus health and queue depth
5. Review Function App CPU/memory metrics
6. Consider scaling out (more instances)
7. Check for cold start issues
8. Review processing logic for inefficiencies

**Investigation Queries**:
```kql
// Slowest dependencies
dependencies
| where timestamp > ago(15m)
| summarize avg(duration), max(duration) by name
| order by max_duration desc
```

### Dead Letter Queue Alert
**Trigger**: Messages moved to dead letter queue

**Response Steps**:
1. Navigate to Service Bus Explorer → Dead Letter Queue
2. Review message details and dead letter reason
3. Check exception logs in Application Insights for corresponding orderId
4. Determine if issue is data-related or system-related
5. For data issues: Fix validation and resubmit manually
6. For system issues: Fix code/config and redeploy
7. Use Service Bus Explorer to resubmit valid messages
8. Document pattern to prevent recurrence

**Investigation Queries**:
```kql
// Failed order details
customEvents
| where timestamp > ago(1h)
| where name == "OrderProcessingFailed"
| extend orderId = tostring(customDimensions.orderId),
         error = tostring(customDimensions.error)
| project timestamp, orderId, error
```

### Dependency Failure Alert
**Trigger**: External service calls failing >10 times in 5 minutes

**Response Steps**:
1. Identify which dependency is failing
2. Check the external service status page
3. Review retry policies and circuit breaker settings
4. Check network connectivity and firewall rules
5. Verify API credentials and endpoints
6. Contact service owner if persistent issues
7. Consider temporary fallback or graceful degradation
8. Monitor recovery and adjust retry policies if needed

**Investigation Queries**:
```kql
// Dependency failures by service
dependencies
| where timestamp > ago(15m)
| where success == false
| summarize FailureCount = count(),
            LastError = take_any(customDimensions.error)
  by name
| order by FailureCount desc
```

## Daily Operations Checklist

### Morning Health Check
- [ ] Check dashboard for overnight anomalies
- [ ] Review error rate trends from past 24h
- [ ] Check dead letter queue count
- [ ] Verify all active alerts are acknowledged
- [ ] Review performance trends (any degradation?)
- [ ] Check resource utilization (CPU, memory, storage)
- [ ] Verify backup and retention policies

### Throughout the Day
- [ ] Monitor Live Metrics during peak hours
- [ ] Watch for sudden spikes in error rates
- [ ] Track queue depth and message age
- [ ] Review alert notifications as they arrive
- [ ] Check dependency health periodically

### End of Day
- [ ] Review daily processing summary
- [ ] Check for any unresolved incidents
- [ ] Document any issues or patterns observed
- [ ] Plan any needed maintenance or improvements

## Weekly Review

### Performance Analysis
- [ ] Analyze error patterns over the week
- [ ] Review performance trends (improvements or degradations)
- [ ] Identify slowest dependencies
- [ ] Check for any recurring issues
- [ ] Review top 10 slowest orders

### Cost Optimization
- [ ] Review Application Insights data ingestion
- [ ] Check sampling effectiveness
- [ ] Review log retention policies
- [ ] Identify opportunities to reduce telemetry without losing visibility

### Capacity Planning
- [ ] Review processing volumes and trends
- [ ] Check Function App scaling patterns
- [ ] Plan for expected volume increases
- [ ] Review and adjust autoscaling rules

### Documentation
- [ ] Update runbooks based on incidents
- [ ] Document new alert response procedures
- [ ] Update architecture diagrams if changed
- [ ] Review and update KQL queries

## Troubleshooting Common Issues

### Orders Not Processing

**Symptoms**: Orders submitted but not completing

**Investigation**:
1. Check Service Bus queue metrics - messages accumulating?
2. Verify Function App is running and not stopped
3. Check Function App logs for errors
4. Verify connection strings are correct
5. Check for exceptions in Application Insights
6. Verify Service Bus permissions

**Common Causes**:
- Function App stopped or scaled to zero
- Invalid connection string after rotation
- Service Bus namespace down
- Code deployment issue
- Configuration error

### High Latency

**Symptoms**: Orders taking longer than normal to process

**Investigation**:
1. Check dependency performance in Application Insights
2. Review Service Bus queue depth
3. Check Function App CPU/memory metrics
4. Review network latency
5. Check for cold start issues
6. Review recent code or configuration changes

**Common Causes**:
- External service degradation
- Queue backlog causing delays
- Insufficient Function App instances
- Cold start after period of inactivity
- Inefficient code changes
- Database or storage throttling

### Missing Telemetry

**Symptoms**: No data appearing in Application Insights

**Investigation**:
1. Verify APPLICATIONINSIGHTS_CONNECTION_STRING is set
2. Check TelemetryService initialization logs
3. Ensure telemetry.flush() is called before function exits
4. Check sampling settings - may be sampling out all events
5. Verify firewall rules allow traffic to Application Insights
6. Check for errors in function logs
7. Verify Application Insights resource is not deleted

**Common Causes**:
- Missing or incorrect connection string
- Sampling set too aggressively
- Network firewall blocking Application Insights
- Forgot to call flush() in serverless functions
- Application Insights instance deleted

### Correlation IDs Not Linking Events

**Symptoms**: Cannot trace orders end-to-end

**Investigation**:
1. Verify correlation ID is in request headers (x-correlation-id)
2. Check that correlation ID is added to Service Bus message
3. Verify all telemetry calls include correlation ID
4. Check correlation ID extraction logic in OrderProcessor
5. Verify format is consistent across functions

**Common Causes**:
- Correlation ID not passed in message metadata
- Extraction logic not reading from correct location
- Format mismatch between functions
- Header not set in API calls

### High Application Insights Costs

**Symptoms**: Unexpected charges for Application Insights

**Investigation**:
1. Check total data ingestion in past month
2. Review which data types consuming most (metrics, events, traces)
3. Identify any particularly noisy logs or metrics
4. Check sampling configuration
5. Review retention period settings

**Solutions**:
- Increase sampling percentage (reduce from 100% to 20%)
- Filter out noisy logs in host.json
- Adjust retention period (default 90 days)
- Use appropriate log levels (avoid verbose in production)
- Consider daily cap on ingestion
- Archive old data to blob storage for long-term retention

### Alerts Not Firing

**Symptoms**: Issues occurring but no alerts received

**Investigation**:
1. Test KQL query directly in Log Analytics
2. Verify action group is configured correctly
3. Check alert rule is enabled
4. Review evaluation frequency and window size
5. Verify email addresses in action group
6. Check alert rule threshold values
7. Verify sufficient data for query to execute

**Common Causes**:
- Alert rule disabled
- Action group email addresses incorrect
- Query syntax error or returns no results
- Threshold set too high/low
- Evaluation window too large/small
- Insufficient data retention

## Using Correlation IDs for Troubleshooting

Correlation IDs enable end-to-end tracing of orders through the system.

### Finding Correlation ID
1. From API response headers: `x-correlation-id`
2. From order submission response body
3. From any log entry related to the order

### Tracing an Order
```kql
let correlationId = "YOUR-CORRELATION-ID-HERE";
union requests, dependencies, customEvents, traces, exceptions
| where timestamp > ago(7d)
| where customDimensions.correlationId == correlationId
| project timestamp, itemType, name,
          duration = coalesce(duration, 0),
          success = coalesce(success, true),
          message = coalesce(message, "")
| order by timestamp asc
```

This shows the complete journey of an order:
1. **Request**: Initial order submission
2. **Custom Event**: OrderSubmissionStarted
3. **Dependency**: Service Bus message send
4. **Custom Event**: OrderProcessingStarted
5. **Dependencies**: Inventory, Payment, Shipping calls
6. **Custom Event**: OrderProcessed or OrderProcessingFailed

## Dashboard Tiles

Recommended tiles for your Azure Dashboard:

### Tile 1: Order Processing Rate (Line Chart)
Shows orders processed over time to identify patterns and issues.

### Tile 2: Success vs Failure (Area Chart)
Visualizes successful vs failed orders to quickly spot problems.

### Tile 3: Average Processing Duration (Line Chart)
Tracks performance trends to identify degradation.

### Tile 4: Active Exceptions (Pie Chart)
Shows distribution of error types for quick diagnosis.

### Tile 5: Dependency Health (Bar Chart)
Displays success rate of external services.

### Tile 6: Queue Depth (Line Chart)
Monitors backlog to identify processing bottlenecks.

## Best Practices

### Logging
- Use structured logging with consistent properties
- Include correlation IDs in all log entries
- Use appropriate log levels
- Avoid logging sensitive information (PII, credentials)

### Alerting
- Set realistic thresholds based on historical data
- Avoid alert fatigue - too many false positives
- Ensure alerts are actionable
- Document response procedures for each alert
- Test alerts regularly

### Telemetry
- Always flush telemetry before function exits
- Use consistent naming for events and metrics
- Include relevant properties for filtering
- Track both successes and failures
- Monitor dependency performance

### Performance
- Set appropriate sampling rates
- Use log levels to control verbosity
- Archive old data to reduce costs
- Optimize queries for dashboard tiles
- Index frequently queried properties

## Emergency Contacts

- **Azure Support**: [Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- **Service Bus Issues**: Check Azure Status page
- **Application Insights**: Review service health
- **On-Call Engineer**: See team rotation schedule

## Additional Resources

### From This Repository
- 📊 [KQL Query Library](./KQL-QUERIES.md) - 40+ ready-to-use queries
- 📈 [Workbook Setup Guide](./WORKBOOK-SETUP-GUIDE.md) - Step-by-step workbook import instructions


### Microsoft Documentation
- [Application Insights Documentation](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Kusto Query Language (KQL)](https://learn.microsoft.com/azure/data-explorer/kusto/query/)
- [Azure Functions Monitoring](https://learn.microsoft.com/azure/azure-functions/functions-monitoring)
- [Service Bus Monitoring](https://learn.microsoft.com/azure/service-bus-messaging/monitor-service-bus)
- [Azure Workbooks](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview)
