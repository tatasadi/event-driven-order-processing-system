'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OrdersList } from '@/components/features/orders/orders-list';

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted">
        <OrdersList />
      </main>
      <Footer />
    </div>
  );
}
