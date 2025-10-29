targetScope = 'subscription'

// ============================================================================
// PARAMETERS
// ============================================================================

@description('The environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string

@description('The Azure region for resources')
param location string = 'westeurope'

@description('The base name for all resources')
@minLength(3)
@maxLength(10)
param projectName string = 'orderproc'

@description('Tags to apply to all resources')
param tags object = {
  Environment: environment
  Project: 'OrderProcessingSystem'
  ManagedBy: 'Bicep'
}

// ============================================================================
// VARIABLES
// ============================================================================

var resourceGroupName = 'rg-${projectName}-${environment}'

// ============================================================================
// RESOURCE GROUP
// ============================================================================

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

// ============================================================================
// MODULES
// ============================================================================

// Service Bus (Message Queue)
module serviceBus 'modules/servicebus.bicep' = {
  name: 'serviceBusDeployment'
  scope: rg
  params: {
    location: location
    environment: environment
    projectName: projectName
    tags: tags
  }
}

// Application Insights (Monitoring)
module appInsights 'modules/appinsights.bicep' = {
  name: 'appInsightsDeployment'
  scope: rg
  params: {
    location: location
    environment: environment
    projectName: projectName
    tags: tags
  }
}

// Storage Account (Required for Azure Functions)
module storage 'modules/storage.bicep' = {
  name: 'storageDeployment'
  scope: rg
  params: {
    location: location
    environment: environment
    projectName: projectName
    tags: tags
  }
}

// Function App (Backend)
module functionApp 'modules/functionapp.bicep' = {
  name: 'functionAppDeployment'
  scope: rg
  params: {
    location: location
    environment: environment
    projectName: projectName
    tags: tags
    storageAccountName: storage.outputs.storageAccountName
    appInsightsConnectionString: appInsights.outputs.connectionString
    serviceBusConnectionString: serviceBus.outputs.connectionString
    serviceBusQueueName: serviceBus.outputs.queueName
  }
  dependsOn: [
    storage
    appInsights
    serviceBus
  ]
}

// Static Web App (Frontend)
module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticWebAppDeployment'
  scope: rg
  params: {
    location: location
    environment: environment
    projectName: projectName
    tags: tags
    functionAppUrl: functionApp.outputs.functionAppUrl
  }
  dependsOn: [
    functionApp
  ]
}

// ============================================================================
// OUTPUTS
// ============================================================================

output resourceGroupName string = rg.name
output resourceGroupId string = rg.id
output location string = location

// Service Bus outputs
output serviceBusNamespace string = serviceBus.outputs.namespaceName
output serviceBusConnectionString string = serviceBus.outputs.connectionString
output queueName string = serviceBus.outputs.queueName

// Application Insights outputs
output appInsightsName string = appInsights.outputs.appInsightsName
output appInsightsConnectionString string = appInsights.outputs.connectionString
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey

// Storage outputs
output storageAccountName string = storage.outputs.storageAccountName
output storageAccountId string = storage.outputs.storageAccountId

// Function App outputs
output functionAppName string = functionApp.outputs.functionAppName
output functionAppUrl string = functionApp.outputs.functionAppUrl
output functionAppPrincipalId string = functionApp.outputs.functionAppPrincipalId

// Static Web App outputs
output staticWebAppName string = staticWebApp.outputs.staticWebAppName
output staticWebAppUrl string = staticWebApp.outputs.staticWebAppUrl
output staticWebAppDeploymentToken string = staticWebApp.outputs.deploymentToken
