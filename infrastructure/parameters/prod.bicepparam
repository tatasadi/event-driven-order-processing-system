using '../main.bicep'

param environment = 'prod'
param location = 'westeurope'
param projectName = 'orderproc'

param tags = {
  Environment: 'Production'
  Project: 'OrderProcessingSystem'
  ManagedBy: 'Bicep'
  CostCenter: 'Engineering'
}
