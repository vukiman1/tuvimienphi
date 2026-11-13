import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { LazyAuthModal } from './lazy-auth-modal';

const MOCK_STALE_CHUNK_MESSAGE =
  'Failed to fetch dynamically imported module: https://xemtuvimienphi.top/assets/auth-modal-old.js';
const RELOAD_MARKER_KEY = `tanstack_router_reload:${MOCK_STALE_CHUNK_MESSAGE}`;

jest.mock('./auth-modal', () => {
  throw new TypeError(MOCK_STALE_CHUNK_MESSAGE);
});

function renderAt(initialEntry: string): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rootRoute = createRootRoute({
    validateSearch: z.object({
      auth: z.enum(['login', 'register']).optional(),
      redirect: z.string().optional(),
    }),
    component: () => (
      <>
        <LazyAuthModal />
        <p>home page</p>
      </>
    ),
    errorComponent: () => <p>error page</p>,
  });
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('LazyAuthModal after a deploy removed its chunk', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useAuthStore.setState({ user: null, isInitializing: false });
  });

  it('reloads the page instead of replacing it with the error page', async () => {
    renderAt('/?auth=login');

    await waitFor(() => expect(window.sessionStorage.getItem(RELOAD_MARKER_KEY)).toBe('1'));
    expect(screen.getByText('home page')).toBeTruthy();
    expect(screen.queryByText('error page')).toBeNull();
  });
});
