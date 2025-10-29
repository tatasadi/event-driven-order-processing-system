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

var logAnalyticsName = 'log-${projectName}-${environment}'
var appInsightsName = 'ai-${projectName}-${environment}'

// ============================================================================
// LOG ANALYTICS WORKSPACE
// ============================================================================

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30                          // 30 days retention
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ============================================================================
// APPLICATION INSIGHTS
// ============================================================================

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    RetentionInDays: 30
    IngestionMode: 'LogAnalytics'
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

output appInsightsName string = appInsights.name
output appInsightsId string = appInsights.id
output instrumentationKey string = appInsights.properties.InstrumentationKey
output connectionString string = appInsights.properties.ConnectionString
output workspaceId string = logAnalyticsWorkspace.id
output workspaceName string = logAnalyticsWorkspace.name
