import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 md:py-16 lg:py-20">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Orders</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              View and manage all your orders in one place.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-12 md:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                The orders list functionality will be implemented in the next phase.
                You'll be able to view, filter, and manage all your orders here.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
