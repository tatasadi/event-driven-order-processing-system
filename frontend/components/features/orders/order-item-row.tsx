'use client';

import { Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCTS } from '@/data/products';
import { CreateOrderFormData } from '@/lib/validations/order.schema';

interface OrderItemRowProps {
  index: number;
  control: Control<CreateOrderFormData>;
  setValue: UseFormSetValue<CreateOrderFormData>;
  onRemove: () => void;
  isRemovable: boolean;
}

export function OrderItemRow({
  index,
  control,
  setValue,
  onRemove,
  isRemovable,
}: OrderItemRowProps) {
  // Watch the product selection to update price automatically
  const selectedProductId = useWatch({
    control,
    name: `items.${index}.productId`,
  });

  const quantity = useWatch({
    control,
    name: `items.${index}.quantity`,
  });

  const price = useWatch({
    control,
    name: `items.${index}.price`,
  });

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId);
  const lineTotal = quantity && price ? quantity * price : 0;

  return (
    <div className="grid gap-4 rounded-lg border p-4 relative">
      {/* Remove button */}
      {isRemovable && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Product Selection */}
        <FormField
          control={control}
          name={`items.${index}.productId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select
                onValueChange={(value) => {
                  const product = PRODUCTS.find((p) => p.id === value);
                  if (product) {
                    field.onChange(value);
                    // Also update product name and price
                    setValue(`items.${index}.productName`, product.name, { shouldValidate: true });
                    setValue(`items.${index}.price`, product.price, { shouldValidate: true });
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCTS.filter((p) => p.inStock).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - €{product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quantity */}
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Product Details & Line Total */}
      {selectedProduct && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p className="flex-1">{selectedProduct.description}</p>
          <p className="font-semibold text-foreground ml-4">
            Line Total: €{lineTotal.toFixed(2)}
          </p>
        </div>
      )}

      {/* Hidden fields for productName and price */}
      <FormField
        control={control}
        name={`items.${index}.productName`}
        render={({ field }) => <input type="hidden" {...field} />}
      />
      <FormField
        control={control}
        name={`items.${index}.price`}
        render={({ field }) => (
          <input
            type="hidden"
            {...field}
            value={field.value || 0}
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
          />
        )}
      />
    </div>
  );
}
