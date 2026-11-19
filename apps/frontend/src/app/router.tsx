import { createRouter } from '@tanstack/react-router';
import { PageLoader } from '@/components/ui/page-loader';
import type { ChapterTone } from '@/design-system';
import { queryClient } from '@/lib/query-client';
import { routeTree } from '../routeTree.gen';
import { focusHashTargetOnRender } from './focus-hash-target-on-render';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPendingComponent: PageLoader,
});

focusHashTargetOnRender(router);

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    readonly isStoryPage?: boolean;
    readonly openingTone?: ChapterTone;
  }
}
