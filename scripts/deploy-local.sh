#!/bin/bash

set -e

ENVIRONMENT=${1:-dev}
LOCATION="westeurope"

echo "=========================================="
echo "Deploying to environment: ${ENVIRONMENT}"
echo "=========================================="

# Deploy infrastructure
echo ""
echo "1. Deploying infrastructure..."
az deployment sub create \
  --location ${LOCATION} \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/${ENVIRONMENT}.bicepparam

# Get outputs
echo ""
echo "2. Getting deployment outputs..."
RESOURCE_GROUP=$(az deployment sub show \
  --name main \
  --query properties.outputs.resourceGroupName.value \
  --output tsv)

FUNCTION_APP_NAME=$(az deployment sub show \
  --name main \
  --query properties.outputs.functionAppName.value \
  --output tsv)

STATIC_WEB_APP_NAME=$(az deployment sub show \
  --name main \
  --query properties.outputs.staticWebAppName.value \
  --output tsv)

echo "Resource Group: ${RESOURCE_GROUP}"
echo "Function App: ${FUNCTION_APP_NAME}"
echo "Static Web App: ${STATIC_WEB_APP_NAME}"

# Deploy backend
echo ""
echo "3. Deploying backend..."
cd backend/functions
npm ci
npm run build
func azure functionapp publish ${FUNCTION_APP_NAME}
cd ../..

# Deploy frontend (if exists)
echo ""
echo "4. Checking frontend..."
if [ -f "frontend/order-portal/package.json" ]; then
  echo "Deploying frontend..."
  SWA_TOKEN=$(az staticwebapp secrets list \
    --name ${STATIC_WEB_APP_NAME} \
    --resource-group ${RESOURCE_GROUP} \
    --query properties.apiKey \
    --output tsv)

  cd frontend/order-portal
  npm ci
  npm run build

  npx @azure/static-web-apps-cli deploy \
    --deployment-token ${SWA_TOKEN} \
    --app-location out
  cd ../..
else
  echo "Frontend not ready yet. Skipping..."
fi

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
echo "Function App URL: https://${FUNCTION_APP_NAME}.azurewebsites.net"
echo "Static Web App URL: https://$(az staticwebapp show --name ${STATIC_WEB_APP_NAME} --resource-group ${RESOURCE_GROUP} --query defaultHostname -o tsv)"
echo ""
echo "Test the health endpoint:"
echo "curl https://${FUNCTION_APP_NAME}.azurewebsites.net/api/health"
