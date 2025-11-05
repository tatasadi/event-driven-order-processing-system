# Phase 6: Next.js 15 Frontend Setup

This phase implements the foundational frontend architecture for the Event-Driven Order Processing System.

## 🎯 What Was Built

### ✅ Core Setup
- **Next.js 15** with App Router - Latest React framework
- **TypeScript** configuration - End-to-end type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui components** - Beautiful, accessible UI components

### ✅ Project Structure
```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── orders/
│   │   ├── page.tsx        # Orders list (placeholder)
│   │   └── new/
│   │       └── page.tsx    # New order form (placeholder)
│   └── globals.css         # Global styles with CSS variables
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   └── dropdown-menu.tsx
│   ├── layout/             # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── theme-toggle.tsx    # Dark mode toggle
├── lib/
│   ├── api/                # API client
│   │   ├── client.ts       # Base HTTP client
│   │   └── orders.ts       # Orders API
│   ├── providers/          # React providers
│   │   ├── query-provider.tsx
│   │   └── theme-provider.tsx
│   └── utils.ts            # Utility functions
├── types/
│   └── order.types.ts      # Type definitions
└── config/
    └── site.ts             # Site configuration
```

### ✅ Features Implemented

#### 1. Type-Safe API Client
- Custom `ApiClient` class with error handling
- Timeout management (30 seconds)
- Type-safe request/response handling
- `ApiError` class for structured error handling

#### 2. Type Definitions
Matching backend types exactly:
- `OrderStatus` enum
- `OrderItem` interface
- `Order` interface
- `CreateOrderRequest` interface
- `CreateOrderResponse` interface

#### 3. React Query Integration
- TanStack Query for data fetching
- Configured with:
  - 1 minute stale time
  - 1 retry on failure
  - Automatic caching

#### 4. Dark Mode Support
- next-themes for theme management
- Custom theme toggle component
- Smooth transitions between light/dark modes
- System preference detection
- CSS variables for theming

#### 5. Layout Components
- **Header**: Sticky navigation with theme toggle
- **Footer**: Simple footer with branding
- Responsive design
- Mobile-friendly navigation

#### 6. Home Page
- Hero section with call-to-action buttons
- Feature cards highlighting:
  - Azure Functions
  - Service Bus
  - Application Insights
- Fully responsive design

## 🛠️ Technologies Used

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

## 🚀 Running the Frontend

### Development
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

## 🌐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api
NEXT_PUBLIC_API_TIMEOUT=30000
```

## 📁 Key Files

### API Client ([lib/api/client.ts](lib/api/client.ts))
- Base HTTP client with fetch
- Automatic timeout handling
- JSON serialization/deserialization
- Typed error responses

### Site Config ([config/site.ts](config/site.ts))
- Centralized configuration
- Environment variable access
- Type-safe settings

### Theme Provider ([lib/providers/theme-provider.tsx](lib/providers/theme-provider.tsx))
- Wraps next-themes
- Enables light/dark/system modes
- Prevents hydration flash

### Type Definitions ([types/order.types.ts](types/order.types.ts))
- Shared types between frontend and backend
- Ensures API contract compliance

## 🎨 Design System

### Colors
The design uses CSS variables for theming:
- `--background` / `--foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--muted` / `--muted-foreground`
- `--accent` / `--accent-foreground`
- `--destructive` / `--destructive-foreground`
- `--border` / `--input` / `--ring`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`

### Typography
- Font: Geist Sans (from Vercel)
- Responsive text sizing
- Proper heading hierarchy

### Spacing
- Container-based layout
- Responsive padding
- Consistent gap spacing

## 🔄 What's Next (Phase 7)

In the next phase, we'll build the order submission form:
- React Hook Form for form handling
- Zod validation schemas
- Product selection UI
- Dynamic order items
- Real-time total calculation
- Submit to Azure Functions API
- Loading states and error handling
- Success notifications

## 📝 Notes

### Component Strategy
- Using shadcn/ui approach (copy components into project)
- Full ownership and customization
- No black-box dependencies

### State Management
- React Query for server state
- React Context for UI state (theme)
- No global state library needed yet

### Code Quality
- TypeScript strict mode enabled
- ESLint configured
- Consistent code formatting
- Proper error boundaries (to be added)

### Performance
- Static generation where possible
- Code splitting by route
- Optimized bundle size (~142 KB for home page)
- Image optimization (Next.js Image component)

### Accessibility
- All shadcn/ui components are ARIA-compliant
- Keyboard navigation support
- Screen reader friendly
- Proper semantic HTML

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Type errors
```bash
rm -rf .next
npm run build
```

### Styling issues
```bash
# Clear Tailwind cache
rm -rf .next
npm run dev
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com)

---

**Phase 6 Complete** ✅

The frontend foundation is now ready for feature development!
