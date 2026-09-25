import {
  Outlet,
  createRootRouteWithContext,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/features/admin/layout/admin-layout';
import { LOGIN_PATH, ensureSession, hasConsoleAccess } from '@/features/auth/route-guards';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    if (location.pathname === LOGIN_PATH) {
      return;
    }
    await ensureSession();
    if (!hasConsoleAccess()) {
      throw redirect({ to: LOGIN_PATH });
    }
  },
  component: RootRoute,
});

function RootRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname === LOGIN_PATH) {
    return <Outlet />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
