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

// ============================================================================
// VARIABLES
// ============================================================================

// Storage account names must be lowercase, no hyphens, globally unique
var storageAccountName = 'st${projectName}${environment}'

// ============================================================================
// STORAGE ACCOUNT
// ============================================================================

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'                         // Locally redundant storage
  }
  kind: 'StorageV2'
  properties: {
    // Security
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false                 // No public blob access
    supportsHttpsTrafficOnly: true               // HTTPS only

    // Performance
    accessTier: 'Hot'                            // Hot access tier

    // Features
    allowSharedKeyAccess: true                   // Required for Functions
    defaultToOAuthAuthentication: false

    // Network
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output primaryEndpoints object = storageAccount.properties.primaryEndpoints
