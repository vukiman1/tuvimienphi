import type { ReactElement } from 'react';
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

function renderAt(initialEntry: string): AnyRouter {
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

  return router;
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
