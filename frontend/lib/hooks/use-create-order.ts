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

    onSuccess: (data) => {
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
