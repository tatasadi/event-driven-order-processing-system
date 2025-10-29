// ============================================================================
// PARAMETERS
// ============================================================================

@description('The Azure region for resources')
param location string

@description('Environment name')
param environment string

@description('Project name for resource naming')
param projectName string

@description('Resource tags')
param tags object

@description('Storage account name')
param storageAccountName string

@description('Application Insights connection string')
param appInsightsConnectionString string

@description('Service Bus connection string')
@secure()
param serviceBusConnectionString string

@description('Service Bus queue name')
param serviceBusQueueName string

// ============================================================================
// VARIABLES
// ============================================================================

var functionAppName = 'func-${projectName}-${environment}'
var appServicePlanName = 'asp-${projectName}-${environment}'

// ============================================================================
// EXISTING RESOURCES
// ============================================================================

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}

// ============================================================================
// APP SERVICE PLAN (CONSUMPTION)
// ============================================================================

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
    size: 'Y1'
    family: 'Y'
  }
  properties: {
    reserved: true  // Required for Linux
  }
}

// ============================================================================
// FUNCTION APP
// ============================================================================

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  tags: tags
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${az.environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${az.environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
        {
          name: 'SERVICE_BUS_CONNECTION_STRING'
          value: serviceBusConnectionString
        }
        {
          name: 'SERVICE_BUS_QUEUE_NAME'
          value: serviceBusQueueName
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://portal.azure.com'
        ]
        supportCredentials: false
      }
    }
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

output functionAppName string = functionApp.name
output functionAppId string = functionApp.id
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppPrincipalId string = functionApp.identity.principalId
