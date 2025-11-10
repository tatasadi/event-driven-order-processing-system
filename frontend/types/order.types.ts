export enum OrderStatus {
  Submitted = 'submitted',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  orderDate: string;
  status: OrderStatus;
}

export interface CreateOrderRequest {
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  currency: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: OrderStatus;
  message: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
  imageUrl?: string;
}
