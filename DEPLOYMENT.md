# Deployment Guide

This guide explains how to deploy the Event-Driven Order Processing System to Azure using CI/CD pipelines and manual deployment scripts.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [GitHub Actions Setup](#github-actions-setup)
- [Manual Deployment](#manual-deployment)
- [Environments](#environments)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

1. **Azure CLI** (version 2.50+)
   ```bash
   az --version
   az login
   ```

2. **Azure Functions Core Tools** (version 4.x)
   ```bash
   func --version
   ```

3. **Node.js** (version 20.x)
   ```bash
   node --version
   npm --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### Azure Resources

- Active Azure subscription
- Sufficient credits/quota for:
  - Service Bus (Standard tier)
  - Azure Functions (Consumption or Premium plan)
  - Application Insights
  - Storage Account
  - Static Web Apps

---

## Quick Start

### 1. Deploy Infrastructure Manually

```bash
# Deploy to development environment
./scripts/deploy-local.sh dev

# Deploy to staging environment
./scripts/deploy-local.sh staging

# Deploy to production environment
./scripts/deploy-local.sh prod
```

### 2. Test the Deployment

```bash
# Get the function app URL from deployment output
curl https://<function-app-name>.azurewebsites.net/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "version": "1.0.0",
#   "environment": "production",
#   "checks": {
#     "serviceBus": "configured",
#     "appInsights": "configured"
#   }
# }
```

---

## GitHub Actions Setup

### Step 1: Create Azure Service Principal

Create a service principal for GitHub Actions to authenticate with Azure:

```bash
# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Create service principal
az ad sp create-for-rbac \
  --name "sp-github-orderproc" \
  --role contributor \
  --scopes /subscriptions/${SUBSCRIPTION_ID} \
  --sdk-auth
```

**Copy the entire JSON output** - you'll need it in the next step.

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**

Add the following secret:

| Name | Value |
|------|-------|
| `AZURE_CREDENTIALS` | Paste the entire JSON output from service principal creation |

### Step 3: Enable GitHub Actions

The repository includes three workflows:

1. **Infrastructure Deployment** (`.github/workflows/deploy-infrastructure.yml`)
   - Triggers: Push to `main`/`master` with changes in `infrastructure/**`
   - Deploys: Bicep templates to create/update Azure resources

2. **Backend Deployment** (`.github/workflows/deploy-backend.yml`)
   - Triggers: Push to `main`/`master` with changes in `backend/**`
   - Deploys: Azure Functions

3. **Frontend Deployment** (`.github/workflows/deploy-frontend.yml`)
   - Triggers: Push to `main`/`master` with changes in `frontend/**`
   - Deploys: Static Web App (when frontend is ready)

### Step 4: Trigger Deployments

**Automatic Deployment (to Development):**
```bash
# Any push to main/master triggers deployment
git add .
git commit -m "Deploy changes"
git push origin main
```

**Manual Deployment (to Staging/Production):**
1. Go to **Actions** tab in GitHub
2. Select the workflow (infrastructure/backend/frontend)
3. Click **Run workflow**
4. Select environment: `staging` or `prod`
5. Click **Run workflow**

---

## Manual Deployment

### Deploy All Components

Use the provided deployment script:

```bash
# Syntax: ./scripts/deploy-local.sh [environment]
./scripts/deploy-local.sh dev
```

The script will:
1. Deploy infrastructure (Bicep templates)
2. Build and deploy backend (Azure Functions)
3. Deploy frontend (if available)
4. Display deployment URLs

### Deploy Individual Components

#### Infrastructure Only

```bash
az deployment sub create \
  --location westeurope \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/dev.bicepparam
```

#### Backend Only

```bash
# Get function app name
FUNCTION_APP_NAME=$(az deployment sub show \
  --name main \
  --query properties.outputs.functionAppName.value \
  --output tsv)

# Deploy
cd backend/functions
npm ci
npm run build
func azure functionapp publish ${FUNCTION_APP_NAME}
```

#### Frontend Only

```bash
# Get resource group and static web app name
RESOURCE_GROUP=$(az deployment sub show \
  --name main \
  --query properties.outputs.resourceGroupName.value \
  --output tsv)

STATIC_WEB_APP_NAME=$(az deployment sub show \
  --name main \
  --query properties.outputs.staticWebAppName.value \
  --output tsv)

# Get deployment token
SWA_TOKEN=$(az staticwebapp secrets list \
  --name ${STATIC_WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query properties.apiKey \
  --output tsv)

# Deploy
cd frontend/order-portal
npm ci
npm run build
npx @azure/static-web-apps-cli deploy \
  --deployment-token ${SWA_TOKEN} \
  --app-location out
```

---

## Environments

### Development (dev)

- **Purpose**: Active development and testing
- **Auto-deploy**: Yes (on push to main/master)
- **Resources**:
  - Service Bus: Basic tier
  - Functions: Consumption plan
  - Static Web App: Free tier

### Staging

- **Purpose**: Pre-production testing
- **Auto-deploy**: No (manual workflow dispatch)
- **Resources**:
  - Service Bus: Standard tier
  - Functions: Consumption plan
  - Static Web App: Free tier

### Production (prod)

- **Purpose**: Live production environment
- **Auto-deploy**: No (manual workflow dispatch)
- **Resources**:
  - Service Bus: Standard tier (with zone redundancy)
  - Functions: Consumption plan (can upgrade to Premium)
  - Static Web App: Standard tier

---

## Rollback Procedure

### Automatic Rollback (Premium Plan Only)

If you're using deployment slots (Premium plan):

```bash
# Rollback production
./scripts/rollback.sh prod

# Rollback staging
./scripts/rollback.sh staging
```

### Manual Rollback (Consumption Plan)

For consumption plans without deployment slots:

#### Option 1: Redeploy Previous Version

```bash
# Checkout previous commit
git log --oneline -10
git checkout <previous-commit-hash>

# Deploy
./scripts/deploy-local.sh prod

# Return to main
git checkout main
```

#### Option 2: Trigger Previous GitHub Action

1. Go to **Actions** tab
2. Find the previous successful deployment
3. Click **Re-run jobs**

---

## Troubleshooting

### Deployment Fails with "Subscription Not Found"

**Solution**: Ensure you're logged into the correct Azure subscription:
```bash
az account list --output table
az account set --subscription "<subscription-id>"
```

### Function App Deployment Times Out

**Solution**: Increase the deployment timeout or check Application Insights for errors:
```bash
# Check function app logs
az monitor app-insights query \
  --app <app-insights-name> \
  --analytics-query "traces | where timestamp > ago(1h) | order by timestamp desc"
```

### Health Endpoint Returns 404

**Causes**:
- Function app hasn't finished starting (wait 30-60 seconds)
- Health function wasn't deployed
- CORS issues

**Solution**:
```bash
# Restart function app
az functionapp restart \
  --name <function-app-name> \
  --resource-group <resource-group-name>

# Check function app status
az functionapp show \
  --name <function-app-name> \
  --resource-group <resource-group-name> \
  --query state
```

### GitHub Actions Fails with Authentication Error

**Solution**: Verify the service principal credentials:
1. Ensure `AZURE_CREDENTIALS` secret is set correctly
2. Check service principal hasn't expired:
   ```bash
   az ad sp list --display-name "sp-github-orderproc"
   ```
3. Verify the service principal has Contributor role on the subscription

### Infrastructure Deployment Fails

**Common Issues**:

1. **Resource name conflicts**:
   - Resource names must be globally unique
   - Modify `projectName` parameter if needed

2. **Quota exceeded**:
   ```bash
   az vm list-usage --location westeurope --output table
   ```

3. **Invalid Bicep syntax**:
   ```bash
   az bicep build --file infrastructure/main.bicep
   ```

---

## Monitoring Deployments

### View Deployment History

```bash
# List all deployments
az deployment sub list --output table

# Show specific deployment
az deployment sub show --name main
```

### Check Function App Health

```bash
# Get function app name
FUNCTION_APP_NAME="func-orderproc-dev-<suffix>"

# Check health
curl https://${FUNCTION_APP_NAME}.azurewebsites.net/api/health

# View application logs
az functionapp log tail \
  --name ${FUNCTION_APP_NAME} \
  --resource-group rg-orderproc-dev
```

### Check Static Web App

```bash
# Get URL
az staticwebapp show \
  --name <static-web-app-name> \
  --resource-group <resource-group-name> \
  --query defaultHostname \
  --output tsv
```

---

## Best Practices

1. **Always test in dev first**
   - Deploy to dev environment
   - Run smoke tests
   - Verify functionality

2. **Use staging for validation**
   - Deploy to staging
   - Run full test suite
   - Get approval before prod

3. **Production deployments**
   - Schedule during low-traffic periods
   - Have rollback plan ready
   - Monitor metrics after deployment

4. **Keep secrets secure**
   - Never commit secrets to git
   - Use GitHub Secrets for CI/CD
   - Rotate service principal credentials regularly

5. **Monitor deployments**
   - Check Application Insights
   - Verify health endpoints
   - Monitor Service Bus metrics

---

## Additional Resources

- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Check Azure Portal for resource status
4. Review Application Insights logs
