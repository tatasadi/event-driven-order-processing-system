import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center gap-12 py-24 md:py-32 lg:py-40">
          <div className="flex max-w-[980px] flex-col items-center gap-8 text-center">
            <h1 className="text-5xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl xl:text-8xl">
              Event-Driven Order Processing
            </h1>
            <p className="max-w-[750px] text-xl leading-relaxed text-gray-600 dark:text-gray-400 sm:text-2xl">
              A production-ready order processing system built with Azure
              Functions, Service Bus, and Next.js 15.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/orders/new">Submit Order</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/orders">View Orders</Link>
            </Button>
          </div>
          <div className="mt-20 grid gap-8 md:grid-cols-3 max-w-6xl w-full">
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">Azure Functions</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Serverless order submission and processing with automatic scaling
              </p>
            </div>
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">Service Bus</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Reliable message queuing with retry logic and dead-letter handling
              </p>
            </div>
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">Application Insights</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Full observability with metrics, logs, and distributed tracing
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
