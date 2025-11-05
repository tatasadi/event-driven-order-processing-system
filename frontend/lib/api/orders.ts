import { apiClient } from './client';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/types/order.types';

export const ordersApi = {
  createOrder: async (
    request: CreateOrderRequest
  ): Promise<CreateOrderResponse> => {
    return apiClient.post<CreateOrderResponse, CreateOrderRequest>(
      '/orders',
      request
    );
  },
};
