import { createRouter } from '@tanstack/react-router';
import { PageLoader } from '@/components/ui/page-loader';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '../routeTree.gen';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPendingComponent: PageLoader,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
