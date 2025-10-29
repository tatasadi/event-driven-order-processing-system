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

@description('Function App URL for backend API')
param functionAppUrl string

// ============================================================================
// VARIABLES
// ============================================================================

var staticWebAppName = 'swa-${projectName}-${environment}'

// ============================================================================
// STATIC WEB APP
// ============================================================================

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: ''  // Will be configured later via GitHub/Azure DevOps
    branch: ''
    buildProperties: {
      appLocation: '/frontend/order-portal'
      apiLocation: ''  // We're using a separate Function App
      outputLocation: 'out'  // Next.js static export output
    }
    provider: 'None'  // Manual deployment initially
  }
}

// ============================================================================
// APP SETTINGS
// ============================================================================

resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    NEXT_PUBLIC_API_URL: functionAppUrl
    NEXT_PUBLIC_ENVIRONMENT: environment
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================

output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output deploymentToken string = staticWebApp.listSecrets().properties.apiKey
