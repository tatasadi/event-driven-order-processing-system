import { Product } from '@/types/order.types';

/**
 * Sample product catalog
 * In production, this would come from an API
 */
export const PRODUCTS: Product[] = [
  {
    id: 'PROD-001',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    currency: 'EUR',
    inStock: true,
    imageUrl: '/products/headphones.jpg',
  },
  {
    id: 'PROD-002',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking and notifications',
    price: 399.99,
    currency: 'EUR',
    inStock: true,
    imageUrl: '/products/smartwatch.jpg',
  },
  {
    id: 'PROD-003',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with custom switches',
    price: 149.99,
    currency: 'EUR',
    inStock: true,
    imageUrl: '/products/keyboard.jpg',
  },
  {
    id: 'PROD-004',
    name: 'Portable SSD 1TB',
    description: 'Fast and reliable portable storage',
    price: 129.99,
    currency: 'EUR',
    inStock: true,
    imageUrl: '/products/ssd.jpg',
  },
  {
    id: 'PROD-005',
    name: 'Webcam 4K Ultra HD',
    description: 'Professional quality video streaming',
    price: 199.99,
    currency: 'EUR',
    inStock: false,
    imageUrl: '/products/webcam.jpg',
  },
  {
    id: 'PROD-006',
    name: 'USB-C Hub Multi-Port',
    description: '7-in-1 USB-C adapter with 4K HDMI',
    price: 79.99,
    currency: 'EUR',
    inStock: true,
    imageUrl: '/products/usb-hub.jpg',
  },
];

/**
 * Get product by ID
 */
export function getProductById(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId);
}

/**
 * Get available products
 */
export function getAvailableProducts(): Product[] {
  return PRODUCTS.filter((p) => p.inStock);
}
