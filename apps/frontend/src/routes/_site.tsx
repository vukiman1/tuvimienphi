import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/layout/site-header';

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
