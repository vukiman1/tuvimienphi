import { createRouter } from '@tanstack/react-router';
import { PageLoader } from '@/components/ui/page-loader';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '../routeTree.gen';

export const router = createRouter({
  routeTree,
  // The console lives under /admin, so every route is prefixed with it (route `to` values stay
  // relative, e.g. '/users' → '/admin/users'). Assets stay at the domain root, so on Vercel a
  // static-host SPA rewrite maps /admin/* → index.html (see apps/dashboard/vercel.json).
  basepath: '/admin',
  context: { queryClient },
  defaultPendingComponent: PageLoader,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
