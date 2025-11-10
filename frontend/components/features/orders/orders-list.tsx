'use client';

import { useState, useEffect } from 'react';
import { PackageSearch, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StoredOrder {
  orderId: string;
  customerId: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  submittedAt: string;
  status: 'submitted' | 'processing' | 'completed' | 'failed';
}

export function OrdersList() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = localStorage.getItem('submittedOrders');
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Failed to parse stored orders:', error);
      }
    }
  }, []);

  const getStatusBadge = (status: StoredOrder['status']) => {
    const statusConfig = {
      submitted: {
        label: 'Submitted',
        variant: 'secondary' as const,
        icon: <Clock className="h-3 w-3" />,
      },
      processing: {
        label: 'Processing',
        variant: 'default' as const,
        icon: <Clock className="h-3 w-3 animate-spin" />,
      },
      completed: {
        label: 'Completed',
        variant: 'default' as const,
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      failed: {
        label: 'Failed',
        variant: 'destructive' as const,
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status];

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 md:py-16 lg:py-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Orders</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            View and track your submitted orders
          </p>
        </div>
        <Link href="/orders/new">
          <Button size="lg">Create New Order</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <PackageSearch className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
              You haven't submitted any orders yet. Create your first order to get started.
            </p>
            <Link href="/orders/new">
              <Button>Create Your First Order</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('submittedOrders');
                setOrders([]);
              }}
            >
              Clear All
            </Button>
          </div>

          {orders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Order #{order.orderId.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(order.submittedAt)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer
                    </p>
                    <p className="text-sm font-semibold">{order.customerId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Items
                    </p>
                    <p className="text-sm font-semibold">
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Amount
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Order ID: {order.orderId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Note: Orders are being processed asynchronously via Azure Service Bus.
                    Check Application Insights for processing status.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">About Order Tracking</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            This list shows orders submitted from this browser. Orders are processed asynchronously
            through Azure Service Bus and Azure Functions.
          </p>
          <p>
            To view actual processing status:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Check Azure Application Insights for detailed telemetry</li>
            <li>Monitor the Service Bus queue in Azure Portal</li>
            <li>Review function execution logs in Azure Functions</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
