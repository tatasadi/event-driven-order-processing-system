import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function NewOrderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 md:py-16 lg:py-20">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Submit New Order</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Create a new order for processing through our event-driven system.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-12 md:p-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <svg
                  className="mx-auto h-20 w-20 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-semibold mb-6">Order Form Coming Soon</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                The order submission form will be implemented in Phase 7. It will include:
              </p>
              <div className="grid gap-6 md:grid-cols-2 text-left">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-base">Customer Details</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer ID and email validation
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-base">Product Selection</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add multiple items with quantities
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-base">Real-time Calculation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Live total amount updates
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-base">Form Validation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Zod schema with error messages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
