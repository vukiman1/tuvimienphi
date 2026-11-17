import { act, render, screen, waitFor } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { z } from 'zod';
import { AuthModal } from './auth-modal';
import { GoogleOneTap } from './google-one-tap';
import { ensureGoogleIdentity } from '@/lib/google-identity';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import { usePendingTwoFactor } from './pending-two-factor-store';

jest.mock('@/config/app-config', () => ({
  appConfig: {
    app: { name: 'Test', environment: 'test' },
    api: { baseUrl: 'http://localhost:3000/api' },
    sentry: { dsn: '' },
    google: { clientId: 'test-client-id' },
    media: { baseUrl: 'http://localhost/media' },
  },
}));
jest.mock('@/lib/google-identity', () => ({
  ensureGoogleIdentity: jest.fn(),
  promptGoogleOneTap: jest.fn(),
}));
jest.mock('@/services/auth-service', () => ({
  authService: { googleOneTap: jest.fn(), login: jest.fn() },
}));
jest.mock('./google-sign-in-button', () => ({
  GoogleSignInButton: () => null,
}));

const LESSON_PATH = '/kien-thuc/tu-vi-la-gi';
const SETTINGS_PATH = '/dashboard/settings';

function renderAt(initialEntry: string) {
  const rootRoute = createRootRoute({
    validateSearch: z.object({
      auth: z.enum(['login', 'register']).optional(),
      redirect: z.string().optional(),
    }),
    component: () => (
      <>
        <GoogleOneTap />
        <AuthModal />
        <p>page</p>
      </>
    ),
  });
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' });
  const lessonRoute = createRoute({ getParentRoute: () => rootRoute, path: '/kien-thuc/$slug' });
  const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: SETTINGS_PATH });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, lessonRoute, settingsRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

function registeredCallback(): (credential: string) => void | Promise<void> {
  const { callback } = jest.mocked(ensureGoogleIdentity).mock.calls[0][0];
  if (!callback) {
    throw new Error('One Tap did not register a credential callback');
  }
  return callback;
}

async function fireGoogleCredential(): Promise<void> {
  await waitFor(() => expect(ensureGoogleIdentity).toHaveBeenCalled());
  const callback = registeredCallback();
  await act(async () => {
    await callback('credential-1');
  });
}

describe('Google sign-in stays on the page', () => {
  let scrollTo: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    jest.mocked(ensureGoogleIdentity).mockResolvedValue(undefined as never);
    jest
      .mocked(authService.googleOneTap)
      .mockResolvedValue({ user: { email: 'reader@example.com' } } as never);
    useAuthStore.setState({ user: null, isInitializing: false });
    usePendingTwoFactor.setState({ challengeToken: null });
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  it('keeps a One Tap reader on the lesson they are reading', async () => {
    const router = renderAt(LESSON_PATH);
    await screen.findByText('page');
    scrollTo.mockClear();
    const hrefBefore = router.state.location.href;
    const onBeforeNavigate = jest.fn();
    router.subscribe('onBeforeNavigate', onBeforeNavigate);

    await fireGoogleCredential();

    expect(useAuthStore.getState().user).toEqual({ email: 'reader@example.com' });
    expect(router.state.location.href).toBe(hrefBefore);
    expect(onBeforeNavigate).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("closes the modal over the same lesson after the modal's Google button", async () => {
    const router = renderAt(`${LESSON_PATH}?auth=login`);
    await screen.findByRole('dialog');
    scrollTo.mockClear();

    await fireGoogleCredential();

    await waitFor(() => expect(router.state.location.search).toEqual({}));
    expect(router.state.location.pathname).toBe(LESSON_PATH);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("follows a guard's redirect, as the email form does", async () => {
    const router = renderAt(`/?auth=login&redirect=${SETTINGS_PATH}`);
    await screen.findByRole('dialog');

    await fireGoogleCredential();

    await waitFor(() => expect(router.state.location.pathname).toBe(SETTINGS_PATH));
  });

  it('finishes on the page the reader is on now, not where Google was set up', async () => {
    const router = renderAt('/');
    await screen.findByText('page');
    await waitFor(() => expect(ensureGoogleIdentity).toHaveBeenCalled());
    const callback = registeredCallback();

    await act(async () => {
      await router.navigate({ to: LESSON_PATH, search: { auth: 'login' } });
    });
    await act(async () => {
      await callback('credential-1');
    });

    await waitFor(() => expect(router.state.location.search).toEqual({}));
    expect(router.state.location.pathname).toBe(LESSON_PATH);
  });
});
