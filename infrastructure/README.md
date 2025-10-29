# Azure Infrastructure - Bicep Templates

Complete Infrastructure as Code for the Event-Driven Order Processing System.

---

## 📦 What Gets Deployed

Running the Bicep deployment creates **6 Azure resources**:

### Core Infrastructure
1. **Resource Group** - Container for all resources
2. **Service Bus Namespace** (Standard) + Queue
3. **Application Insights** + Log Analytics Workspace
4. **Storage Account** (for Azure Functions)

### Application Resources
5. **Azure Function App** (Consumption Plan)
   - Pre-configured with all connection strings
   - CORS enabled
   - Ready for code deployment

6. **Azure Static Web App** (Free tier)
   - Configured for Next.js 15
   - Connected to Function App
   - Ready for frontend deployment

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│   Resource Group        │
│   rg-orderproc-dev      │
└─────────────────────────┘
           │
           ├─── Service Bus Namespace (sb-orderproc-dev)
           │    └─── Queue: orders-queue
           │
           ├─── Application Insights (ai-orderproc-dev)
           │    └─── Log Analytics (log-orderproc-dev)
           │
           ├─── Storage Account (storderprocdev)
           │
           ├─── Function App (func-orderproc-dev)
           │    ├─── App Service Plan (asp-orderproc-dev)
           │    └─── Settings: Service Bus, App Insights
           │
           └─── Static Web App (swa-orderproc-dev)
                └─── Env Vars: API_URL
```

---

## 📁 File Structure

```
infrastructure/
├── main.bicep                      # Main orchestration template
├── modules/                        # Reusable modules
│   ├── servicebus.bicep           # Service Bus + Queue
│   ├── appinsights.bicep          # App Insights + Log Analytics
│   ├── storage.bicep              # Storage Account
│   ├── functionapp.bicep          # Function App + Plan
│   └── staticwebapp.bicep         # Static Web App
├── parameters/                     # Environment configurations
│   ├── dev.bicepparam             # Development
│   └── prod.bicepparam            # Production
└── README.md                       # This file
```

---

## 🚀 Deployment

### Prerequisites

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "Your Subscription Name"

# Verify
az account show
```

### Deploy to Development

```bash
# Navigate to infrastructure directory
cd infrastructure

# Validate template
az deployment sub validate \
  --location westeurope \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam

# Deploy
az deployment sub create \
  --name orderproc-infra-dev-$(date +%Y%m%d-%H%M%S) \
  --location westeurope \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam
```

**Deployment time:** 5-7 minutes

### Deploy to Production

```bash
az deployment sub create \
  --name orderproc-infra-prod-$(date +%Y%m%d-%H%M%S) \
  --location westeurope \
  --template-file main.bicep \
  --parameters parameters/prod.bicepparam
```

---

## 📋 Modules Overview

### 1. Service Bus Module (`servicebus.bicep`)

**Creates:**
- Service Bus Namespace (Standard tier)
- Queue: `orders-queue`
- Authorization Rule with Send/Listen permissions

**Key Configuration:**
- Max delivery count: 10
- Lock duration: 5 minutes
- TTL: 14 days
- Dead letter queue: Enabled
- Duplicate detection: 10 minutes

### 2. Application Insights Module (`appinsights.bicep`)

**Creates:**
- Log Analytics Workspace
- Application Insights (connected to workspace)

**Configuration:**
- Retention: 30 days
- Type: Web application

### 3. Storage Module (`storage.bicep`)

**Creates:**
- Storage Account (Standard_LRS)

**Configuration:**
- TLS 1.2 minimum
- HTTPS only
- No public blob access
- Hot access tier

### 4. Function App Module (`functionapp.bicep`) ✨ NEW

**Creates:**
- App Service Plan (Consumption/Y1)
- Function App (Node.js 20, Linux)
- System-assigned Managed Identity

**Pre-configured App Settings:**
- `ServiceBusConnectionString` - From Service Bus module
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - From App Insights
- `ServiceBusQueueName` - orders-queue
- `ENVIRONMENT` - dev/staging/prod
- All required Azure Functions settings

**Features:**
- CORS enabled (Azure Portal + configurable origins)
- HTTPS only
- Ready for code deployment

### 5. Static Web App Module (`staticwebapp.bicep`) ✨ NEW

**Creates:**
- Static Web App (Free tier)

**Configuration:**
- Build: Next.js (App Router)
- App location: `/frontend/order-portal`
- Output: `.next`
- Optional GitHub integration

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Function App URL
- `NEXT_PUBLIC_ENVIRONMENT` - dev/staging/prod

---

## 🔑 Retrieving Outputs

After deployment, get important values:

```bash
# Get all outputs
az deployment sub show \
  --name orderproc-infra-dev-<timestamp> \
  --query properties.outputs

# Service Bus connection string
az deployment sub show \
  --name orderproc-infra-dev-<timestamp> \
  --query properties.outputs.serviceBusConnectionString.value -o tsv

# Function App URL
az deployment sub show \
  --name orderproc-infra-dev-<timestamp> \
  --query properties.outputs.functionAppUrl.value -o tsv

# Static Web App URL
az deployment sub show \
  --name orderproc-infra-dev-<timestamp> \
  --query properties.outputs.staticWebAppUrl.value -o tsv
```

---

## 🔄 Update CORS After Deployment

After Static Web App is deployed, update Function App CORS:

```bash
# Get Static Web App hostname
SWA_URL=$(az deployment sub show \
  --name orderproc-infra-dev-<timestamp> \
  --query properties.outputs.staticWebAppUrl.value -o tsv)

# Add to Function App CORS
az functionapp cors add \
  --name func-orderproc-dev \
  --resource-group rg-orderproc-dev \
  --allowed-origins $SWA_URL
```

---

## 🧪 Verify Deployment

### Check Resources

```bash
# List all resources in resource group
az resource list \
  --resource-group rg-orderproc-dev \
  --output table

# Should show 6-7 resources:
# - Service Bus Namespace
# - Queue (child of namespace)
# - Application Insights
# - Log Analytics Workspace
# - Storage Account
# - App Service Plan
# - Function App
# - Static Web App
```

### Test Service Bus

```bash
# Send test message
az servicebus queue send \
  --resource-group rg-orderproc-dev \
  --namespace-name sb-orderproc-dev \
  --name orders-queue \
  --body '{"orderId":"test-001","status":"submitted"}'

# Peek at messages
az servicebus queue message peek \
  --resource-group rg-orderproc-dev \
  --namespace-name sb-orderproc-dev \
  --name orders-queue
```

### Verify Function App

```bash
# Check Function App status
az functionapp show \
  --name func-orderproc-dev \
  --resource-group rg-orderproc-dev \
  --query "{name:name,state:state,hostNames:defaultHostName}" -o table

# List app settings
az functionapp config appsettings list \
  --name func-orderproc-dev \
  --resource-group rg-orderproc-dev \
  --output table
```

### Verify Static Web App

```bash
# Check Static Web App
az staticwebapp show \
  --name swa-orderproc-dev \
  --resource-group rg-orderproc-dev \
  --query "{name:name,url:defaultHostname}" -o table
```

---

## 💰 Cost Estimation

### Development Environment

| Resource | SKU/Tier | Est. Monthly Cost |
|----------|----------|-------------------|
| Service Bus | Standard | ~$10 |
| Application Insights | Pay-as-you-go (Free 1GB) | $0-5 |
| Log Analytics | Pay-as-you-go | $0-2 |
| Storage Account | Standard_LRS | ~$1 |
| Function App | Consumption Plan | $0-5 (first 1M free) |
| Static Web App | Free | $0 |
| **Total** | | **~$11-23/month** |

### Production Environment

Costs may increase based on:
- Service Bus throughput
- Function executions
- Storage usage
- Application Insights data volume

---

## 🔒 Security Features

### Implemented

✅ TLS 1.2 minimum on all resources
✅ HTTPS only for Function App
✅ No public blob access on Storage
✅ Managed Identity for Function App
✅ Connection strings not in code (parameters)
✅ Secure parameter handling

### Recommended Enhancements

For production:
- Enable Azure Key Vault for secrets
- Use Managed Identity for Service Bus access
- Enable Private Endpoints
- Configure Virtual Network integration
- Enable Azure Front Door for Static Web App
- Implement Azure AD authentication

---

## 🧹 Cleanup

Delete everything:

```bash
# Delete resource group (deletes all resources)
az group delete \
  --name rg-orderproc-dev \
  --yes \
  --no-wait

# Check deletion status
az group show --name rg-orderproc-dev
```

---

## 🐛 Troubleshooting

### Issue: Deployment fails with "name already exists"

**Cause:** Storage account or Static Web App names must be globally unique.

**Solution:**
```bicep
// In parameters file, change projectName
param projectName = 'orderproc2'  // or use your initials
```

### Issue: Function App not starting

**Check:**
```bash
# View Function App logs
az functionapp log tail \
  --name func-orderproc-dev \
  --resource-group rg-orderproc-dev
```

### Issue: Static Web App build fails

**Check:**
- Verify `appLocation` path is correct
- Ensure `outputLocation` matches Next.js output (`.next`)
- Check GitHub Actions workflow logs

---

## 📚 Resources

- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Service Bus Documentation](https://learn.microsoft.com/en-us/azure/service-bus-messaging/)
- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)

---

## ✅ Next Steps

After infrastructure is deployed:

1. **Phase 3:** Deploy Function code
   ```bash
   cd backend/functions
   func azure functionapp publish func-orderproc-dev
   ```

2. **Phase 6:** Deploy Frontend
   ```bash
   # Configured via GitHub Actions automatically
   # Or manual deploy to Static Web App
   ```

---

**Infrastructure is ready! Time to build the application! 🚀**
