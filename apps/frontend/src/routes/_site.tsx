import { Outlet, createFileRoute } from '@tanstack/react-router';
import { MobileNavBar } from '@/components/layout/mobile-nav-bar';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-muted/40">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      {/* Footer hidden on mobile — replaced by MobileNavBar */}
      <div className="hidden md:block">
        <SiteFooter />
      </div>
      <MobileNavBar />
      {/* Bottom padding on mobile so content clears the fixed nav bar (64px bar height) */}
      <div className="h-[calc(64px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
    </div>
  );
}
