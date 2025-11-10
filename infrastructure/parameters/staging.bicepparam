using '../main.bicep'

param environment = 'staging'
param location = 'westeurope'
param projectName = 'orderproc'

param tags = {
  Environment: 'Staging'
  Project: 'OrderProcessingSystem'
  ManagedBy: 'Bicep'
  CostCenter: 'Engineering'
}
