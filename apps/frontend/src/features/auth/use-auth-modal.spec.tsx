import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { z } from 'zod';
import { useAuthModal } from './use-auth-modal';

const LESSON_PATH = '/kien-thuc/tu-vi-la-gi';

function AuthModalProbe(): React.JSX.Element {
  const { open, close, finish } = useAuthModal();
  return (
    <>
      <button onClick={() => void open('login')}>open</button>
      <button onClick={() => void close()}>close</button>
      <button onClick={() => void finish()}>finish</button>
    </>
  );
}

function renderAt(initialEntry: string) {
  const rootRoute = createRootRoute({
    validateSearch: z.object({
      auth: z.enum(['login', 'register']).optional(),
      redirect: z.string().optional(),
    }),
    component: AuthModalProbe,
  });
  const lessonRoute = createRoute({ getParentRoute: () => rootRoute, path: '/kien-thuc/$slug' });
  const router = createRouter({
    routeTree: rootRoute.addChildren([lessonRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe('useAuthModal', () => {
  let scrollTo: jest.SpyInstance;

  beforeEach(() => {
    scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  it('opens the modal on the same page without scrolling to the top', async () => {
    const router = renderAt(LESSON_PATH);
    const openButton = await screen.findByText('open');
    scrollTo.mockClear();
    fireEvent.click(openButton);

    await waitFor(() => expect(router.state.location.search).toEqual({ auth: 'login' }));
    expect(router.state.location.pathname).toBe(LESSON_PATH);
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('closes the modal without scrolling to the top', async () => {
    const router = renderAt(`${LESSON_PATH}?auth=login`);
    const closeButton = await screen.findByText('close');
    scrollTo.mockClear();
    fireEvent.click(closeButton);

    await waitFor(() => expect(router.state.location.search).toEqual({}));
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('does nothing when there is no modal or redirect to finish', async () => {
    const router = renderAt(LESSON_PATH);
    const onBeforeNavigate = jest.fn();
    router.subscribe('onBeforeNavigate', onBeforeNavigate);

    fireEvent.click(await screen.findByText('finish'));
    await Promise.resolve();

    expect(onBeforeNavigate).not.toHaveBeenCalled();
  });
});
