'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OrdersList } from '@/components/features/orders/orders-list';

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <OrdersList />
      </main>
      <Footer />
    </div>
  );
}
