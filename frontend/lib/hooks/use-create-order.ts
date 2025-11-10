import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { useToast } from '@/components/ui/use-toast';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/types/order.types';
import { ApiError } from '@/lib/api/client';

export function useCreateOrder() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<CreateOrderResponse, ApiError, CreateOrderRequest>({
    mutationFn: (orderData: CreateOrderRequest) => ordersApi.createOrder(orderData),

    onSuccess: (data, variables) => {
      // Store order in localStorage for the orders list
      const storedOrders = localStorage.getItem('submittedOrders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];

      const totalAmount = variables.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const newOrder = {
        orderId: data.orderId,
        customerId: variables.customerId,
        customerEmail: variables.customerEmail,
        totalAmount,
        currency: variables.currency,
        itemCount: variables.items.length,
        submittedAt: new Date().toISOString(),
        status: 'submitted' as const,
      };

      orders.unshift(newOrder); // Add to beginning
      localStorage.setItem('submittedOrders', JSON.stringify(orders.slice(0, 50))); // Keep last 50

      toast({
        title: 'Order Submitted Successfully!',
        description: `Order ID: ${data.orderId}. Your order has been received and is being processed.`,
        variant: 'default',
      });

      // Navigate to success page
      router.push(`/orders/success?orderId=${data.orderId}`);
    },

    onError: (error) => {
      console.error('Order submission failed:', error);

      toast({
        title: 'Order Submission Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
