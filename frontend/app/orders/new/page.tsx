import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OrderForm } from '@/components/features/orders/order-form';

export const metadata: Metadata = {
  title: 'New Order',
  description: 'Submit a new order to the processing system',
};

export default function NewOrderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <OrderForm />
      </main>
      <Footer />
    </div>
  );
}
