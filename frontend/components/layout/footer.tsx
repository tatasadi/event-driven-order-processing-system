import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 md:py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center justify-between gap-6 md:h-24 md:flex-row">
        <p className="text-base text-muted-foreground text-center md:text-left">
          Built with Next.js and Azure
        </p>
        <p className="text-base text-muted-foreground">
          {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
