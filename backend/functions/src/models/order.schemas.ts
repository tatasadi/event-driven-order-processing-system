import { z } from 'zod';

// OrderItem schema
export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

// Order submission request schema
export const OrderSubmissionRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  customerEmail: z.email('Invalid email address'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  currency: z.string().length(3).default('EUR'),
});

// Validate order submission
export function validateOrderSubmission(data: unknown) {
  return OrderSubmissionRequestSchema.parse(data);
}