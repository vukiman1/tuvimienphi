import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import type { AnyRouter } from '@tanstack/react-router';
import type { SeoHead } from '@/lib/seo';

interface RenderAtRouteOptions {
  readonly path: string;
  readonly routePath: string;
  readonly element: ReactElement;
  readonly head?: () => SeoHead;
}

function RootLayout(): ReactElement {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}

export interface RenderedRoute extends RenderResult {
  readonly router: AnyRouter;
  readonly queryClient: QueryClient;
}

export async function renderAtRoute({
  path,
  routePath,
  element,
  head,
}: RenderAtRouteOptions): Promise<RenderedRoute> {
  const rootRoute = createRootRoute({ component: RootLayout });
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: routePath,
    head,
    component: () => element,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await router.load();
  return { ...result, router, queryClient };
}
