# Frontend Usage Guide

This guide explains how to use the Order Processing Frontend application.

## Quick Start

1. **Start the backend** (in one terminal):
   ```bash
   cd backend/functions
   npm start
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**: http://localhost:3000

---

## Creating an Order

### Step 1: Navigate to Create Order
- Click "Create Order" from the home page, or
- Visit http://localhost:3000/orders/new

### Step 2: Fill in Customer Information
- **Customer ID**: Enter a customer ID (e.g., `CUST-001`)
  - Must be uppercase letters, numbers, and hyphens only
  - Minimum 3 characters

- **Email Address**: Enter customer email (e.g., `customer@example.com`)
  - Valid email format required

- **Currency**: Select EUR, USD, or GBP

### Step 3: Add Order Items
1. Click the **"Add Item"** button
2. Select a product from the dropdown
3. Enter the quantity (1-99)
4. The line total calculates automatically
5. Repeat to add more items (up to 20)

### Step 4: Review & Submit
- Check the order summary on the right sidebar
- Review total items and amount
- Click **"Submit Order"**

### Why is the Submit Button Disabled?

The submit button is disabled when:
- ❌ No items have been added (click "Add Item" first)
- ❌ Customer ID is invalid (check format rules)
- ❌ Email is invalid
- ❌ Any item is missing product selection or quantity
- ✅ Once all fields are valid, the button will enable!

---

## Viewing Orders

### Orders List Page
Visit http://localhost:3000/orders to see all submitted orders from this browser.

**Features**:
- View all submitted orders
- See order status (submitted/processing/completed/failed)
- Check order details (customer, items, total)
- Clear all orders with one click

**Note**: Orders are stored in browser localStorage and will persist until you:
- Clear browser data
- Click "Clear All" on the orders page
- Use a different browser

---

## Order Processing Flow

```
1. Submit Order (Frontend)
   ↓
2. POST /api/orders (Backend API)
   ↓
3. Send to Service Bus Queue
   ↓
4. Order Processor Function (Async)
   ↓
5. Check Application Insights for Results
```

### Checking Order Processing Status

Orders are processed asynchronously. To see what happened:

1. **Azure Application Insights**:
   ```bash
   # Get App Insights name from deployment
   az monitor app-insights query \
     --app <app-insights-name> \
     --analytics-query "traces | where message contains 'Order' | order by timestamp desc"
   ```

2. **Service Bus Queue**:
   - Go to Azure Portal → Service Bus → Queues → `orders`
   - Check Active Messages, Dead-letter messages
   - View queue metrics

3. **Function App Logs**:
   ```bash
   az functionapp log tail \
     --name <function-app-name> \
     --resource-group <resource-group-name>
   ```

---

## Available Products

The demo includes these products:

| Product ID | Name | Price | Stock |
|------------|------|-------|-------|
| PROD-001 | Premium Wireless Headphones | €299.99 | ✅ In Stock |
| PROD-002 | Smart Watch Pro | €399.99 | ✅ In Stock |
| PROD-003 | Mechanical Keyboard | €149.99 | ✅ In Stock |
| PROD-004 | Portable SSD 1TB | €129.99 | ✅ In Stock |
| PROD-005 | Webcam 4K Ultra HD | €199.99 | ❌ Out of Stock |
| PROD-006 | USB-C Hub Multi-Port | €79.99 | ✅ In Stock |

---

## Common Issues & Solutions

### Issue: Submit button stays disabled

**Solution**:
1. Click "Add Item" button first
2. Select a product from the dropdown
3. Enter a quantity
4. Fill in customer ID (uppercase, e.g., `CUST-001`)
5. Fill in a valid email address
6. Button should now be enabled!

### Issue: Order submitted but not in orders list

**Check**:
- The orders list page at `/orders`
- Orders are stored in browser localStorage
- Try refreshing the page
- Check browser console for errors

### Issue: API request fails

**Check**:
1. Backend is running (`npm start` in `backend/functions`)
2. Backend URL in `.env.local` is correct:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api
   ```
3. No CORS errors in browser console
4. Function app is running properly

### Issue: Form validation errors

**Customer ID**:
- Must be 3+ characters
- Only uppercase letters, numbers, and hyphens
- Examples: `CUST-001`, `ABC-123`, `CUSTOMER-999`

**Email**:
- Must be valid email format
- Examples: `user@example.com`, `customer@company.co.uk`

---

## Testing the Full Flow

### End-to-End Test

1. **Start Backend**:
   ```bash
   cd backend/functions
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create Order**:
   - Go to http://localhost:3000/orders/new
   - Customer ID: `TEST-001`
   - Email: `test@example.com`
   - Currency: EUR
   - Add Item: Premium Wireless Headphones, Quantity: 2
   - Submit

4. **Verify Backend**:
   - Check function terminal for log output
   - Should see "Order submitted successfully"
   - Order ID will be displayed

5. **Check Service Bus** (if deployed to Azure):
   ```bash
   # Check queue has messages
   az servicebus queue show \
     --name orders \
     --namespace-name <namespace> \
     --resource-group <rg> \
     --query countDetails
   ```

6. **View in Orders List**:
   - Go to http://localhost:3000/orders
   - Your order should appear with status "submitted"

---

## Local Storage Data

Orders are stored in `localStorage` with key: `submittedOrders`

**View stored orders**:
```javascript
// In browser console
JSON.parse(localStorage.getItem('submittedOrders'))
```

**Clear orders**:
```javascript
localStorage.removeItem('submittedOrders')
```

Or use the "Clear All" button on the orders page.

---

## Next Steps

To make the frontend production-ready:

1. **Add real-time order status updates**
   - Implement SignalR or WebSockets
   - Poll backend API for status

2. **Add order details page**
   - View individual order information
   - See item breakdown
   - Track processing history

3. **Add authentication**
   - User login/logout
   - Customer-specific orders
   - Role-based access

4. **Add error handling**
   - Better error messages
   - Retry logic
   - Offline support

5. **Add analytics**
   - Order metrics
   - Customer insights
   - Performance tracking

---

## Environment Variables

The frontend uses these environment variables (in `.env.local`):

```env
# API endpoint (local development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api

# API timeout in milliseconds
NEXT_PUBLIC_API_TIMEOUT=30000
```

For production deployment, update these to your Azure Function App URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-function-app.azurewebsites.net/api
```

---

## Support

For issues:
1. Check browser console for errors
2. Check backend function logs
3. Verify environment variables
4. Ensure backend is running
5. Review this guide

Happy ordering! 🛒
