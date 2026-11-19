import { act, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type AnyRouter,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { LazyAuthModal, preloadAuthModal } from './lazy-auth-modal';

const mockAuthModalLoaded = jest.fn();
const mockAuthModalMounted = jest.fn();

jest.mock('./auth-modal', () => {
  mockAuthModalLoaded();
  const { createElement, useEffect } = jest.requireActual<typeof import('react')>('react');
  const { AuthModal } = jest.requireActual<typeof import('./auth-modal')>('./auth-modal');
  return {
    AuthModal: function MountCountingAuthModal(): ReactElement {
      useEffect(() => {
        mockAuthModalMounted();
      }, []);
      return createElement(AuthModal);
    },
  };
});
jest.mock('@/services/auth-service', () => ({
  authService: { login: jest.fn() },
}));
jest.mock('./google-sign-in-button', () => ({
  GoogleSignInButton: () => null,
}));

function createAppRouter(initialEntry: string): AnyRouter {
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
  });
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' });
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
}

function appTree(router: AnyRouter): ReactElement {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

function renderAt(initialEntry: string): AnyRouter {
  const router = createAppRouter(initialEntry);
  render(appTree(router));
  return router;
}

async function prerenderedRoot(): Promise<HTMLElement> {
  const router = createAppRouter('/');
  await router.load();
  const container = document.createElement('div');
  container.innerHTML = renderToString(appTree(router));
  document.body.append(container);
  return container;
}

describe('LazyAuthModal', () => {
  beforeEach(() => {
    mockAuthModalMounted.mockClear();
    useAuthStore.setState({ user: null, isInitializing: false });
  });

  it('leaves the modal code unloaded while the auth param is absent', async () => {
    renderAt('/');

    await screen.findByText('home page');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mockAuthModalLoaded).not.toHaveBeenCalled();
  });

  it('loads the modal code ahead of time when preloaded', async () => {
    expect(mockAuthModalLoaded).not.toHaveBeenCalled();

    preloadAuthModal();

    await waitFor(() => expect(mockAuthModalLoaded).toHaveBeenCalled());
  });

  it('opens straight from a link carrying auth=login', async () => {
    renderAt('/?auth=login');

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(await screen.findByRole('button', { name: /tiếp tục với email/i })).toBeTruthy();
  });

  it('hydrates a prerendered page reloaded with auth=login, then opens the modal', async () => {
    const container = await prerenderedRoot();
    const router = createAppRouter('/?auth=login');
    await router.load();
    const onRecoverableError = jest.fn();

    const root = await act(async () =>
      hydrateRoot(container, appTree(router), { onRecoverableError }),
    );
    const dialog = await screen.findByRole('dialog');
    act(() => root.unmount());
    container.remove();

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(dialog).toBeTruthy();
  });

  it('closes when dismissed and opens again on the register view', async () => {
    const router = renderAt('/?auth=login');
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));

    await waitFor(() => expect(router.state.location.search).toEqual({}));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await router.navigate({ to: '/', search: { auth: 'register' } });

    expect(await screen.findByRole('heading', { name: /tạo tài khoản/i })).toBeTruthy();
  });

  it('keeps the same modal mounted across a close and a reopen', async () => {
    const router = renderAt('/?auth=login');
    await screen.findByRole('dialog');

    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await router.navigate({ to: '/', search: { auth: 'login' } });

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(mockAuthModalMounted).toHaveBeenCalledTimes(1);
  });
});
