using '../main.bicep'

param environment = 'dev'
param location = 'westeurope'
param projectName = 'orderproc'

param tags = {
  Environment: 'Development'
  Project: 'OrderProcessingSystem'
  ManagedBy: 'Bicep'
  CostCenter: 'Engineering'
}
