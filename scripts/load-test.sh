#!/bin/bash

# Load Test Script for Order Processing System
# This script sends multiple order requests to test the system under load

set -e

# Configuration
ENDPOINT="${FUNCTION_APP_URL:-http://localhost:7071}/api/orders"
CORRELATION_ID_PREFIX="load-test-$(date +%s)"
NUM_REQUESTS="${NUM_REQUESTS:-10}"
CONCURRENT_BATCH="${CONCURRENT_BATCH:-10}"
DELAY_BETWEEN_BATCHES="${DELAY_BETWEEN_BATCHES:-1}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Order Processing System - Load Test${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  Endpoint:              $ENDPOINT"
echo "  Total Requests:        $NUM_REQUESTS"
echo "  Concurrent Batch Size: $CONCURRENT_BATCH"
echo "  Delay Between Batches: ${DELAY_BETWEEN_BATCHES}s"
echo "  Correlation ID Prefix: $CORRELATION_ID_PREFIX"
echo ""
echo -e "${YELLOW}Starting load test...${NC}"
echo ""

# Track statistics
SUCCESS_COUNT=0
FAILURE_COUNT=0
START_TIME=$(date +%s)

# Product catalog for variety
PRODUCTS=(
  "Laptop:999.99"
  "Mouse:29.99"
  "Keyboard:79.99"
  "Monitor:299.99"
  "Webcam:89.99"
  "Headphones:149.99"
  "USB Cable:9.99"
  "Hard Drive:119.99"
  "Graphics Card:599.99"
  "RAM:159.99"
)

# Currency options
CURRENCIES=("USD" "EUR" "GBP")

# Function to generate random product
get_random_product() {
  echo "${PRODUCTS[$RANDOM % ${#PRODUCTS[@]}]}"
}

# Function to generate random currency
get_random_currency() {
  echo "${CURRENCIES[$RANDOM % ${#CURRENCIES[@]}]}"
}

# Function to send a single order request
send_order() {
  local REQUEST_NUM=$1
  local CORRELATION_ID="${CORRELATION_ID_PREFIX}-${REQUEST_NUM}"

  # Generate random order data
  local CUSTOMER_ID="CUST-$(printf "%05d" $((RANDOM % 10000)))"
  local CUSTOMER_EMAIL="customer${REQUEST_NUM}@example.com"
  local CURRENCY=$(get_random_currency)

  # Generate 1-3 items
  local NUM_ITEMS=$((RANDOM % 3 + 1))
  local ITEMS="["

  for ((i=0; i<NUM_ITEMS; i++)); do
    local PRODUCT_DATA=$(get_random_product)
    local PRODUCT_NAME=$(echo $PRODUCT_DATA | cut -d':' -f1)
    local PRODUCT_PRICE=$(echo $PRODUCT_DATA | cut -d':' -f2)
    local PRODUCT_ID="PROD-$(printf "%03d" $((RANDOM % 100)))"
    local QUANTITY=$((RANDOM % 5 + 1))

    if [ $i -gt 0 ]; then
      ITEMS+=","
    fi

    ITEMS+="{\"productId\":\"${PRODUCT_ID}\",\"productName\":\"${PRODUCT_NAME}\",\"quantity\":${QUANTITY},\"price\":${PRODUCT_PRICE}}"
  done

  ITEMS+="]"

  # Build JSON payload
  local PAYLOAD="{\"customerId\":\"${CUSTOMER_ID}\",\"customerEmail\":\"${CUSTOMER_EMAIL}\",\"items\":${ITEMS},\"currency\":\"${CURRENCY}\"}"

  # Send request
  local RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "x-correlation-id: ${CORRELATION_ID}" \
    -d "$PAYLOAD")

  local HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  local RESPONSE_BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓${NC} Request #${REQUEST_NUM} - Success (${HTTP_CODE}) - Correlation ID: ${CORRELATION_ID}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}✗${NC} Request #${REQUEST_NUM} - Failed (${HTTP_CODE}) - Correlation ID: ${CORRELATION_ID}"
    echo "   Response: $RESPONSE_BODY"
    ((FAILURE_COUNT++))
  fi
}

# Export function for parallel execution
export -f send_order
export -f get_random_product
export -f get_random_currency
export ENDPOINT
export CORRELATION_ID_PREFIX
export PRODUCTS
export CURRENCIES
export SUCCESS_COUNT
export FAILURE_COUNT
export GREEN
export BLUE
export YELLOW
export RED
export NC

# Main load test loop
for ((batch_start=1; batch_start<=NUM_REQUESTS; batch_start+=CONCURRENT_BATCH)); do
  batch_end=$((batch_start + CONCURRENT_BATCH - 1))
  if [ $batch_end -gt $NUM_REQUESTS ]; then
    batch_end=$NUM_REQUESTS
  fi

  echo -e "${BLUE}Batch $(( (batch_start-1)/CONCURRENT_BATCH + 1 )): Sending requests ${batch_start}-${batch_end}...${NC}"

  # Send batch of requests in parallel
  for ((i=batch_start; i<=batch_end; i++)); do
    send_order $i &
  done

  # Wait for batch to complete
  wait

  # Delay between batches (except for the last batch)
  if [ $batch_end -lt $NUM_REQUESTS ]; then
    sleep $DELAY_BETWEEN_BATCHES
  fi
done

# Calculate statistics
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
REQUESTS_PER_SEC=$(echo "scale=2; $NUM_REQUESTS / $DURATION" | bc)

# Print summary
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Load Test Complete${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}Results:${NC}"
echo "  Total Requests:    $NUM_REQUESTS"
echo -e "  Successful:        ${GREEN}${SUCCESS_COUNT}${NC}"
echo -e "  Failed:            ${RED}${FAILURE_COUNT}${NC}"
echo "  Duration:          ${DURATION}s"
echo "  Requests/Second:   ${REQUESTS_PER_SEC}"
echo ""
echo -e "${YELLOW}To view results in Application Insights:${NC}"
echo "1. Go to Azure Portal → Application Insights"
echo "2. Navigate to Logs"
echo "3. Use the following query:"
echo ""
echo "   customEvents"
echo "   | where customDimensions.correlationId startswith \"${CORRELATION_ID_PREFIX}\""
echo "   | order by timestamp asc"
echo ""
echo -e "${GREEN}Done!${NC}"
