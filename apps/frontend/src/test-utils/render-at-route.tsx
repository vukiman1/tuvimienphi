import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
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
  const result = render(<RouterProvider router={router} />);
  await router.load();
  return { ...result, router };
}
