import { z } from 'zod';

/**
 * Order item validation schema
 */
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
  price: z.number().positive('Price must be positive'),
});

/**
 * Create order form validation schema
 */
export const createOrderFormSchema = z.object({
  customerId: z
    .string()
    .min(3, 'Customer ID must be at least 3 characters')
    .max(50, 'Customer ID is too long')
    .regex(/^[A-Z0-9-]+$/, 'Customer ID must contain only uppercase letters, numbers, and hyphens'),
  customerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long'),
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(20, 'Maximum 20 items per order'),
  currency: z.enum(['EUR', 'USD', 'GBP'], {
    message: 'Please select a valid currency',
  }),
});

/**
 * Infer TypeScript type from schema
 */
export type CreateOrderFormData = z.infer<typeof createOrderFormSchema>;

/**
 * Default form values
 */
export const defaultOrderFormValues: CreateOrderFormData = {
  customerId: '',
  customerEmail: '',
  items: [],
  currency: 'EUR',
};
