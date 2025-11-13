import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl lg:text-2xl">{siteConfig.name}</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-base font-medium">
            <Link
              href="/orders/new"
              className="transition-colors hover:text-foreground text-muted-foreground"
            >
              New Order
            </Link>
            <Link
              href="/orders"
              className="transition-colors hover:text-foreground text-muted-foreground"
            >
              Orders
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
