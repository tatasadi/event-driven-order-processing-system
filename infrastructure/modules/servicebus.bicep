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

var serviceBusNamespaceName = 'sb-${projectName}-${environment}'
var queueName = 'orders-queue'
var authRuleName = 'FunctionAppAccess'

// ============================================================================
// SERVICE BUS NAMESPACE
// ============================================================================

resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: serviceBusNamespaceName
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
    zoneRedundant: false
  }
}

// ============================================================================
// ORDERS QUEUE
// ============================================================================

resource ordersQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: queueName
  properties: {
    // Retry Configuration
    maxDeliveryCount: 10                          // Retry up to 10 times
    lockDuration: 'PT5M'                          // 5 minutes lock

    // Message Lifecycle
    defaultMessageTimeToLive: 'P14D'              // 14 days TTL
    deadLetteringOnMessageExpiration: true        // Enable dead letter queue

    // Duplicate Detection
    requiresDuplicateDetection: true              // Enable duplicate detection
    duplicateDetectionHistoryTimeWindow: 'PT10M'  // 10 minute window

    // Performance
    enablePartitioning: false                     // No partitioning (Standard tier)
    enableBatchedOperations: true                 // Enable batching

    // Features
    enableExpress: false                          // Standard (not Express)
    maxSizeInMegabytes: 1024                     // 1 GB queue size
  }
}

// ============================================================================
// AUTHORIZATION RULE (Connection String)
// ============================================================================

resource authorizationRule 'Microsoft.ServiceBus/namespaces/authorizationRules@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: authRuleName
  properties: {
    rights: [
      'Send'
      'Listen'
    ]
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

output namespaceName string = serviceBusNamespace.name
output namespaceId string = serviceBusNamespace.id
output queueName string = ordersQueue.name
output connectionString string = listKeys(authorizationRule.id, authorizationRule.apiVersion).primaryConnectionString
output primaryKey string = listKeys(authorizationRule.id, authorizationRule.apiVersion).primaryKey
