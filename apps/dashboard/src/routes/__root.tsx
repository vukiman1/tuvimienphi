import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { ensureSession } from '@/features/auth/route-guards';
import { useAuthStore, isAdmin } from '@/stores/auth-store';
import { AdminLayout } from '@/features/admin/layout/admin-layout';
import { AccessDenied } from '@/features/auth/access-denied';
import { PageLoader } from '@/components/ui/page-loader';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Resolve the session before the tree renders so access can be decided synchronously below.
  beforeLoad: ensureSession,
  component: RootRoute,
});

function RootRoute() {
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) return <PageLoader />;
  if (!isAdmin(user)) return <AccessDenied />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
