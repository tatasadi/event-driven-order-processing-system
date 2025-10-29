# Deployed Azure Resources

## Environment: Development

**Resource Group:** rg-orderproc-dev
**Location:** West Europe


### Resources

1. **Service Bus Namespace:** sb-orderproc-dev
   - SKU: Standard
   - Queue: orders-queue
   - Max Delivery Count: 10
   - Lock Duration: 5 minutes

2. **Application Insights:** ai-orderproc-dev
   - Log Analytics: log-orderproc-dev
   - Retention: 30 days

3. **Storage Account:** storderprocdev
   - SKU: Standard_LRS
   - Access Tier: Hot

4. **Function App:** func-orderproc-dev
   - Plan: Consumption (Y1)
   - Runtime: Node.js 20
   - OS: Linux

5. **Static Web App:** swa-orderproc-dev
   - SKU: Free
   - Ready for Next.js deployment

### Connection Strings

Connection strings are stored in:
- `infrastructure/outputs/.env.local` (not committed)

### Costs

Estimated monthly cost (development):
- Service Bus Standard: ~$10/month
- Application Insights: Free tier (1GB/month)
- Storage Account: ~$1/month
- Function App (Consumption): Pay-per-use (~$0-20/month based on usage)
- Static Web App: Free tier
- **Total: ~$11-31/month** (depending on function executions)

### Cleanup

To delete all resources:
```bash
az group delete --name rg-orderproc-dev --yes --no-wait
```