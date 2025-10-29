# Scripts

This directory contains utility scripts for testing and operating the order processing system.

## Available Scripts

### load-test.sh

Load testing script for the Order Processing System.

**Purpose**: Send multiple order requests to test system performance and generate telemetry data.

**Usage**:
```bash
# Set the Function App URL
export FUNCTION_APP_URL="https://your-function-app.azurewebsites.net"

# Optional: Configure test parameters
export NUM_REQUESTS=100              # Total number of requests (default: 100)
export CONCURRENT_BATCH=10           # Requests per batch (default: 10)
export DELAY_BETWEEN_BATCHES=1       # Seconds between batches (default: 1)

# Run the test
./load-test.sh
```

**For Local Testing**:
```bash
# Start the local function app first
cd backend/functions
npm start

# In another terminal, run the load test
export FUNCTION_APP_URL="http://localhost:7071"
export NUM_REQUESTS=20
./scripts/load-test.sh
```

**Features**:
- Generates random order data with variety of products
- Supports multiple currencies (USD, EUR, GBP)
- Tracks success/failure statistics
- Assigns unique correlation IDs for tracing
- Color-coded output for easy monitoring
- Provides Application Insights query to view results

**Output**:
The script displays:
- Progress for each batch
- Success/failure for each request
- Final statistics (total, success, failed, requests/sec)
- KQL query to view results in Application Insights

**Example Output**:
```
================================================
  Order Processing System - Load Test
================================================

Configuration:
  Endpoint:              http://localhost:7071/api/orders
  Total Requests:        20
  Concurrent Batch Size: 10
  Delay Between Batches: 1s
  Correlation ID Prefix: load-test-1234567890

Starting load test...

Batch 1: Sending requests 1-10...
✓ Request #1 - Success (201) - Correlation ID: load-test-1234567890-1
✓ Request #2 - Success (201) - Correlation ID: load-test-1234567890-2
...

================================================
  Load Test Complete
================================================

Results:
  Total Requests:    20
  Successful:        19
  Failed:            1
  Duration:          12s
  Requests/Second:   1.67

To view results in Application Insights:
...
```

**Viewing Results**:
After running the test, use the provided KQL query in Application Insights to analyze:
- Processing times
- Error rates
- Dependency performance
- End-to-end traces

## Future Scripts

Additional scripts that could be added:
- `deploy.sh` - Automated deployment script
- `cleanup-dlq.sh` - Dead letter queue cleanup
- `health-check.sh` - System health verification
- `performance-report.sh` - Generate performance reports
