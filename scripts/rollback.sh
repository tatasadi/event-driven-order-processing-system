#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}
RESOURCE_GROUP="rg-orderproc-${ENVIRONMENT}"

echo "=========================================="
echo "Rolling back ${ENVIRONMENT} environment..."
echo "=========================================="

# Get Function App name
echo ""
echo "1. Getting Function App name..."
FUNCTION_APP_NAME=$(az functionapp list \
  --resource-group ${RESOURCE_GROUP} \
  --query "[?tags.Environment=='${ENVIRONMENT}'].name | [0]" \
  --output tsv)

if [ -z "$FUNCTION_APP_NAME" ]; then
  echo "Error: No Function App found in ${RESOURCE_GROUP} for environment ${ENVIRONMENT}"
  exit 1
fi

echo "Function App: ${FUNCTION_APP_NAME}"

# Check if deployment slots exist (Premium plans only)
echo ""
echo "2. Checking for deployment slots..."
SLOTS=$(az functionapp deployment slot list \
  --name ${FUNCTION_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query "[].name" \
  --output tsv 2>/dev/null || echo "")

if [ -z "$SLOTS" ]; then
  echo "Warning: No deployment slots found. This function app may be on a consumption plan."
  echo "Rollback requires swapping slots, which is only available on Premium plans."
  echo ""
  echo "To rollback on consumption plan, you need to:"
  echo "1. Redeploy the previous version from your CI/CD pipeline"
  echo "2. Or manually deploy the previous version using 'func azure functionapp publish'"
  exit 1
fi

echo "Found deployment slots: ${SLOTS}"

# Swap slots back
echo ""
echo "3. Swapping deployment slots back..."
az functionapp deployment slot swap \
  --name ${FUNCTION_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --slot staging \
  --target-slot production

echo ""
echo "=========================================="
echo "Rollback complete!"
echo "=========================================="

# Verify
echo ""
echo "4. Verifying rollback..."
FUNCTION_URL=$(az functionapp show \
  --name ${FUNCTION_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query defaultHostName \
  --output tsv)

echo "Waiting for app to stabilize..."
sleep 10

echo "Testing health endpoint..."
curl -f https://${FUNCTION_URL}/api/health || echo "Health check failed! Please verify manually."

echo ""
echo "Production URL: https://${FUNCTION_URL}"
