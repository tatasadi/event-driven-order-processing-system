# Event-Driven Order Processing System - Frontend

A modern, production-ready frontend for the Event-Driven Order Processing System built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Features

- ⚡ **Next.js 15** with App Router - Latest React framework with server components
- 🔷 **TypeScript** - End-to-end type safety with shared types
- 🎨 **Tailwind CSS** - Utility-first styling with custom design system
- 🧩 **shadcn/ui** - Beautiful, accessible components you own
- 🌓 **Dark Mode** - Smooth theme switching with next-themes
- 📡 **TanStack Query** - Powerful data fetching and caching
- 🔒 **Type-Safe API** - Custom HTTP client with error handling
- 📱 **Responsive Design** - Mobile-first, works on all devices
- ⚙️ **Production Ready** - Optimized builds, code splitting, and more

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:7071/api` (or configured URL)

## 🛠️ Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api
NEXT_PUBLIC_API_TIMEOUT=30000
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

The page auto-updates as you edit files. Hot reloading is enabled for instant feedback.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── orders/
│   │   ├── page.tsx            # Orders list (upcoming)
│   │   └── new/
│   │       └── page.tsx        # New order form (upcoming)
│   └── globals.css             # Global styles & theme variables
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   └── dropdown-menu.tsx
│   ├── layout/                 # Layout components
│   │   ├── header.tsx         # Navigation header
│   │   └── footer.tsx         # Footer
│   └── theme-toggle.tsx       # Dark mode toggle
├── lib/
│   ├── api/                    # API layer
│   │   ├── client.ts          # Base HTTP client
│   │   └── orders.ts          # Orders API endpoints
│   ├── providers/              # React providers
│   │   ├── query-provider.tsx # TanStack Query setup
│   │   └── theme-provider.tsx # Theme provider
│   └── utils.ts               # Utility functions
├── types/
│   └── order.types.ts         # TypeScript type definitions
├── config/
│   └── site.ts                # Site configuration
├── public/                     # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## 🎨 Design System

### Theme Colors

The application uses CSS variables for a consistent design system:

**Light Mode:**
- Background: White
- Foreground: Dark gray
- Primary: Dark blue
- Secondary: Light gray

**Dark Mode:**
- Background: Dark blue-gray
- Foreground: Off-white
- Primary: Light blue
- Secondary: Medium gray

### Typography

- **Font Family:** Geist Sans (optimized by Next.js)
- **Scale:** Responsive text sizing with Tailwind
- **Headings:** Bold, tight tracking

### Spacing

- Container-based layout (max-width: 1400px)
- Consistent gap spacing (4, 6, 12, 24, 32)
- Responsive padding

## 🔌 API Integration

### API Client

The application includes a type-safe API client with:

- **Timeout handling:** 30 second default
- **Error handling:** Custom `ApiError` class
- **Type safety:** Full TypeScript support
- **Auto JSON:** Automatic serialization/deserialization

Example usage:

```typescript
import { ordersApi } from '@/lib/api/orders';

const response = await ordersApi.createOrder({
  customerId: '123',
  customerEmail: 'customer@example.com',
  items: [
    {
      productId: 'prod-1',
      productName: 'Widget',
      quantity: 2,
      price: 19.99
    }
  ],
  currency: 'USD'
});
```

### Type Definitions

All types are shared between frontend and backend:

```typescript
// Order status
enum OrderStatus {
  Submitted = 'submitted',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

// Order item
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Create order request
interface CreateOrderRequest {
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  currency: string;
}
```

## 🧩 Components

### shadcn/ui Components

This project uses the shadcn/ui approach where components are copied into your project:

**Benefits:**
- ✅ Full ownership and customization
- ✅ No black-box dependencies
- ✅ Built on Radix UI primitives
- ✅ Fully accessible (ARIA compliant)
- ✅ Styled with Tailwind CSS

**Available Components:**
- Button
- Dropdown Menu
- More coming in future phases

### Layout Components

**Header** (`components/layout/header.tsx`)
- Sticky navigation
- Site branding
- Navigation links
- Theme toggle

**Footer** (`components/layout/footer.tsx`)
- Simple footer with branding
- Responsive layout

## 🌓 Dark Mode

Dark mode is implemented using `next-themes` with:

- **Three modes:** Light, Dark, System
- **Smooth transitions:** No flash on page load
- **Persistent:** Saves user preference
- **System detection:** Respects OS preference

Toggle between themes using the sun/moon icon in the header.

## 📊 State Management

### Server State (TanStack Query)

Used for data fetching, caching, and synchronization:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['orders'],
  queryFn: () => ordersApi.getOrders(),
});
```

**Configuration:**
- Stale time: 1 minute
- Retry: 1 attempt
- Automatic caching and refetching

### UI State (React Context)

Used for theme management and other UI state.

## 🚧 Upcoming Features (Phase 7)

The next phase will implement:

- **Order Form:** React Hook Form with Zod validation
- **Product Selection:** Searchable dropdown
- **Dynamic Items:** Add/remove order items
- **Real-time Calculations:** Total amount updates
- **Form Submission:** Integration with Azure Functions
- **Loading States:** Skeletons and spinners
- **Error Handling:** User-friendly error messages
- **Success Notifications:** Toast messages

## 🔧 Configuration

### Tailwind CSS

Custom configuration in `tailwind.config.ts`:
- Extended color palette
- Custom container settings
- Border radius tokens
- Animation keyframes

### TypeScript

Strict mode enabled with:
- Path aliases (`@/*`)
- Latest ES features
- Full type checking

### Next.js

Configured for:
- App Router (not Pages Router)
- Turbopack (dev bundler)
- Image optimization
- Font optimization (Geist)

## 🐛 Troubleshooting

### Port 3000 in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Type errors

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Run type check
npm run type-check
```

### Styling issues

```bash
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

## 📚 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.1 | React framework |
| React | 19 | UI library |
| TypeScript | Latest | Type safety |
| Tailwind CSS | Latest | Styling |
| TanStack Query | Latest | Data fetching |
| next-themes | Latest | Dark mode |
| Radix UI | Latest | Accessible primitives |
| Lucide React | Latest | Icons |
| class-variance-authority | Latest | Component variants |
| clsx & tailwind-merge | Latest | Class name utilities |

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

## 🤝 Contributing

1. Follow the established project structure
2. Maintain TypeScript strict mode compliance
3. Use existing components from shadcn/ui when possible
4. Keep components small and focused
5. Write meaningful commit messages

## 📄 License

This project is part of the Event-Driven Order Processing System.

---

**Built with ❤️ using Next.js 15 and Azure**

For phase-specific documentation, see [PHASE-06-README.md](PHASE-06-README.md)
