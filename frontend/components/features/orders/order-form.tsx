'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrderItemRow } from './order-item-row';
import { OrderSummary } from './order-summary';
import { useCreateOrder } from '@/lib/hooks/use-create-order';
import {
  createOrderFormSchema,
  defaultOrderFormValues,
  CreateOrderFormData,
} from '@/lib/validations/order.schema';

export function OrderForm() {
  const createOrderMutation = useCreateOrder();

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: defaultOrderFormValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedFormData = form.watch();
  const isValid = form.formState.isValid;

  const handleAddItem = () => {
    append({
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
    });
  };

  const handleSubmit = (data: CreateOrderFormData) => {
    // Create order request
    const orderRequest = {
      customerId: data.customerId,
      customerEmail: data.customerEmail,
      items: data.items,
      currency: data.currency,
    };

    // Submit order
    createOrderMutation.mutate(orderRequest);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Order</CardTitle>
              <CardDescription>
                Fill in the customer details and add items to create a new order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Customer ID */}
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CUST-001"
                                {...field}
                                className="font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              Uppercase letters, numbers, and hyphens only
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Customer Email */}
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="customer@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Order confirmation will be sent here
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Currency */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Order Items</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddItem}
                        disabled={fields.length >= 20}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {fields.length === 0 && (
                      <Alert>
                        <AlertDescription>
                          No items added yet. Click "Add Item" to get started.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <OrderItemRow
                          key={field.id}
                          index={index}
                          control={form.control}
                          setValue={form.setValue}
                          onRemove={() => remove(index)}
                          isRemovable={fields.length > 1 || fields.length > 0}
                        />
                      ))}
                    </div>

                    {form.formState.errors.items && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.items.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!isValid || createOrderMutation.isPending || fields.length === 0}
                      className="flex-1"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Order...
                        </>
                      ) : (
                        'Submit Order'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <OrderSummary formData={watchedFormData} />
          </div>
        </div>
      </div>
    </div>
  );
}
