'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreateOrderFormData } from '@/lib/validations/order.schema';

interface OrderSummaryProps {
  formData: CreateOrderFormData;
}

export function OrderSummary({ formData }: OrderSummaryProps) {
  const itemsCount = formData.items.length;
  const totalQuantity = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = formData.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const tax = subtotal * 0.19; // 19% VAT
  const total = subtotal + tax;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items count */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span className="font-medium">
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'} ({totalQuantity} total)
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {formData.currency} {subtotal.toFixed(2)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">VAT (19%)</span>
          <span className="font-medium">
            {formData.currency} {tax.toFixed(2)}
          </span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-bold">
            {formData.currency} {total.toFixed(2)}
          </span>
        </div>

        {/* Customer info if available */}
        {formData.customerId && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer ID</span>
                <span className="font-medium font-mono">{formData.customerId}</span>
              </div>
              {formData.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.customerEmail}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
