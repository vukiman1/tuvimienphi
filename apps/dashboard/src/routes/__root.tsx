import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/features/admin/layout/admin-layout';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
});

/**
 * Admin auth is not wired up yet (there is no admin backend), so the console is open: visiting any
 * route renders it directly. When the backend admin login lands, restore the session guard here —
 * re-add `beforeLoad: ensureSession` and gate on `isAdmin(user)` (see the auth feature) before
 * rendering the layout.
 */
function RootRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
