# Azure Workbook Setup Guide

This guide explains how to import and use the Order Processing System workbook template in Azure Application Insights.

## What is an Azure Workbook?

Azure Workbooks are interactive reports that combine:
- Text and documentation
- KQL queries
- Metrics and visualizations
- Parameters for filtering

They provide a comprehensive view of your application's health and performance in a single dashboard.

## Prerequisites

- Azure subscription with access to Application Insights
- Application Insights instance deployed (created in Phase 2)
- Order processing functions deployed and generating telemetry

## Method 1: Import via Azure Portal (Recommended)

### Step 1: Navigate to Application Insights

1. Open the [Azure Portal](https://portal.azure.com)
2. Navigate to your Application Insights resource:
   - Search for "Application Insights" in the top search bar
   - Select your instance (e.g., `appi-orderproc-dev`)

### Step 2: Open Workbooks

1. In the left navigation menu, find **Monitoring** section
2. Click on **Workbooks**
3. You'll see a gallery of pre-built workbook templates

### Step 3: Create New Workbook

1. Click the **+ New** button at the top
2. An empty workbook editor will open

### Step 4: Open Advanced Editor

1. In the top toolbar, click the **</>** (Advanced Editor) button
2. This opens a JSON editor

### Step 5: Import the Template

1. Open the template file in your repo:
   ```
   docs/WORKBOOK-TEMPLATE.json
   ```

2. Copy the entire JSON content

3. In the Advanced Editor:
   - Select **Gallery Template** from the dropdown (if available)
   - Delete any existing content
   - Paste the copied JSON

4. Click **Apply** at the bottom

### Step 6: Review and Save

1. Click **Done Editing** in the toolbar
2. The workbook will render with all visualizations
3. Click the **Save** icon (💾) in the toolbar
4. Enter a name: `Order Processing Dashboard`
5. Choose location and resource group
6. Click **Save**

### Step 7: Pin to Dashboard (Optional)

1. Once saved, you can pin individual tiles to an Azure Dashboard
2. Click the **📌** icon on any visualization
3. Select or create a dashboard

## Method 2: Import via Azure CLI

If you prefer command-line tools:

```bash
# Set your variables
RESOURCE_GROUP="rg-orderproc-dev"
APP_INSIGHTS_NAME="appi-orderproc-dev"
WORKBOOK_NAME="Order Processing Dashboard"
LOCATION="westeurope"

# Get Application Insights resource ID
APP_INSIGHTS_ID=$(az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "id" -o tsv)

# Create the workbook (requires jq for JSON manipulation)
az rest --method PUT \
  --uri "https://management.azure.com/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/workbooks/$(uuidgen)?api-version=2021-03-08" \
  --body @docs/WORKBOOK-TEMPLATE.json
```

## Using the Workbook

### Time Range Selector

At the top of the workbook, you'll find a **Time Range** parameter:
- **5 minutes**: Real-time monitoring
- **15 minutes**: Recent activity
- **1 hour**: Short-term trends
- **4 hours**: Half-day analysis
- **24 hours**: Daily overview
- **7 days**: Weekly trends

Change this to filter all visualizations in the workbook.

### Available Sections

#### 1. Order Processing Summary
**Tiles showing:**
- Total orders submitted
- Total orders processed
- Total orders failed
- Success rate percentage

#### 2. Order Processing Over Time
**Line chart showing:**
- Successful orders (green)
- Failed orders (red)
- Time series over selected period

#### 3. Error Rate %
**Line chart showing:**
- Error rate percentage over time
- Helps identify spikes in failures

#### 4. Processing Duration
**Multi-line chart showing:**
- Average duration
- 50th percentile (median)
- 95th percentile
- 99th percentile

This helps identify performance degradation.

#### 5. Message Queue Age
**Chart showing:**
- Average time messages wait in queue
- Maximum queue age
- 95th percentile

High values indicate processing backlog.

#### 6. Dependency Performance Summary
**Table showing:**
- Service name
- Average duration
- 95th percentile duration
- Total calls
- Success rate

#### 7. Dependency Success/Failure
**Pie chart showing:**
- Distribution of successful vs failed dependency calls
- Breakdown by service

#### 8. Revenue Summary
**Table showing by currency:**
- Total revenue
- Average order value
- Number of orders

#### 9. Revenue Over Time
**Time series chart:**
- Revenue trends by currency
- Helps track business metrics

#### 10. Recent Exceptions
**Table showing:**
- Timestamp
- Exception type
- Error message
- Order ID
- Correlation ID

Click any row to investigate further.

#### 11. Errors by Type
**Pie chart showing:**
- Distribution of error types
- Helps identify most common issues

## Customizing the Workbook

### Adding New Tiles

1. Click **Edit** in the toolbar
2. Click **+ Add** → **Add query**
3. Write your KQL query (use [KQL-QUERIES.md](./KQL-QUERIES.md) for examples)
4. Choose visualization type (table, chart, graph, etc.)
5. Click **Done Editing**
6. **Save** the workbook

### Example: Add "Top Customers" Tile

```kql
customEvents
| where timestamp > {TimeRange}
| where name == "OrderSubmitted"
| extend customerId = tostring(customDimensions.customerId),
         totalAmount = todouble(customDimensions.totalAmount)
| summarize OrderCount = count(),
            TotalSpent = sum(totalAmount)
  by customerId
| top 10 by OrderCount desc
```

### Modifying Existing Queries

1. Click **Edit**
2. Click the **pencil icon** on any visualization
3. Modify the KQL query
4. Click **Done Editing** → **Save**

### Adding Parameters

Parameters allow dynamic filtering:

1. Click **Edit**
2. Click **+ Add** → **Add parameter**
3. Configure:
   - **Name**: Internal reference
   - **Display name**: User-facing label
   - **Type**: Time range, dropdown, text, etc.
4. Use in queries with `{ParameterName}`

## Sharing the Workbook

### Share with Team Members

1. Open the workbook
2. Click **Share** in the toolbar
3. Choose:
   - **Share link**: Generates a URL
   - **Share to email**: Sends invite
4. Set permissions (View or Edit)

### Export as PDF

1. Open the workbook
2. Click **Download** (⬇️) in toolbar
3. Choose **Download as PDF**
4. Use for reports or documentation

### Share as Template

To share the workbook with other Azure subscriptions:

1. Click **Edit**
2. Click **</>** (Advanced Editor)
3. Copy the JSON
4. Share the JSON file
5. Recipients can import using steps above

## Troubleshooting

### Workbook Shows "No Data"

**Possible causes:**
1. **Time range too narrow**: Extend time range to last 24 hours
2. **No telemetry data**: Run a test order or the load test script
3. **Wrong Application Insights resource**: Verify you're in the correct resource
4. **Sampling too aggressive**: Check host.json sampling settings

**Solution:**
```bash
# Run load test to generate data
export FUNCTION_APP_URL="https://your-function-app.azurewebsites.net"
export NUM_REQUESTS=20
./scripts/load-test.sh
```

### Query Errors

**Error: "Column not found"**
- The telemetry property name may have changed
- Check actual property names in Logs explorer

**Error: "Timeout"**
- Query is too complex or time range too large
- Reduce time range or optimize query

### Visualizations Not Rendering

1. Check browser console for errors (F12)
2. Try refreshing the page
3. Clear browser cache
4. Try different browser (Chrome/Edge recommended)

### Permission Issues

**Error: "You don't have permission"**
- Need at least **Reader** role on Application Insights
- Contact Azure subscription admin

**To grant access:**
```bash
# Grant reader access
az role assignment create \
  --assignee user@example.com \
  --role "Reader" \
  --scope "/subscriptions/{subscription-id}/resourceGroups/{rg}/providers/Microsoft.Insights/components/{app-insights}"
```

## Best Practices

### Regular Maintenance

1. **Review monthly**: Check if queries are still relevant
2. **Update thresholds**: Adjust based on actual performance
3. **Add new metrics**: As system evolves
4. **Remove outdated tiles**: Keep workbook focused

### Performance Optimization

1. **Limit time ranges**: Don't default to 7+ days
2. **Use summarize**: Instead of raw data
3. **Add filters**: Reduce data volume
4. **Cache parameters**: Reuse calculated values

### Organization

1. **Use sections**: Group related visualizations
2. **Add descriptions**: Explain what each tile shows
3. **Use consistent colors**: Green = success, Red = failure
4. **Order by importance**: Most critical metrics first

## Alternative: Use Azure Dashboard

If you prefer a simpler approach:

1. **Azure Portal** → **Dashboard** → **+ New dashboard**
2. Name it "Order Processing"
3. Add **Metrics** tiles:
   - Pin from Application Insights
   - Configure each metric individually
4. Add **Log query** tiles:
   - Use queries from [KQL-QUERIES.md](./KQL-QUERIES.md)

**Pros of Dashboard:**
- Simpler to create
- Can include resources from multiple services
- Better for high-level overview

**Pros of Workbook:**
- Interactive and dynamic
- Better for deep analysis
- Supports parameters and complex layouts
- More professional appearance

## Additional Resources

- [Azure Workbooks Documentation](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview)
- [KQL Query Reference](https://learn.microsoft.com/azure/data-explorer/kusto/query/)
- [Workbook Visualizations](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-visualizations)
- [Sample Workbooks](https://github.com/microsoft/Application-Insights-Workbooks)
- [KQL Query Library](./KQL-QUERIES.md) (from this repo)
- [Monitoring Guide](./MONITORING-GUIDE.md) (from this repo)

## Quick Reference

| Task | Steps |
|------|-------|
| Import workbook | Portal → App Insights → Workbooks → New → Advanced Editor → Paste JSON |
| Change time range | Use Time Range dropdown at top |
| Edit workbook | Click Edit toolbar button |
| Add new visualization | Edit → + Add → Add query |
| Save changes | Click Save icon (💾) |
| Share with team | Share button → Share link or email |
| Export as PDF | Download button → Download as PDF |
| Pin to dashboard | 📌 icon on any tile |

## Next Steps

After importing the workbook:

1. ✅ **Generate test data**: Run `./scripts/load-test.sh`
2. ✅ **Review all sections**: Ensure data appears correctly
3. ✅ **Customize**: Add company-specific metrics
4. ✅ **Share with team**: Distribute access to stakeholders
5. ✅ **Set up alerts**: Based on thresholds identified in workbook
6. ✅ **Schedule reviews**: Weekly performance reviews using the workbook

---

**Need help?** Check the [Monitoring Guide](./MONITORING-GUIDE.md) or the [Phase 5 completion summary](./PHASE-05-COMPLETION.md).
