'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'Unknown';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-2xl py-16 mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Order Submitted Successfully!</CardTitle>
              <CardDescription className="text-base">
                Your order has been received and is being processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order ID */}
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="text-lg font-mono font-semibold">{orderId}</p>
              </div>

              {/* What's Next */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">1.</span>
                    <span>Your order is being validated and processed</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">2.</span>
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">3.</span>
                    <span>We'll notify you when your order ships</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button asChild size="lg">
                  <Link href="/orders/new">
                    Submit Another Order
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              {/* Support Note */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>
                  Questions about your order? Contact us with Order ID: <br />
                  <span className="font-mono font-medium">{orderId}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
