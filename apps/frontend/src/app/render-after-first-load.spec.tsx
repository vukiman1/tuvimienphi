import { act, render, screen } from '@testing-library/react';
import type { AnyRouter } from '@tanstack/react-router';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { renderAfterFirstLoad } from './render-after-first-load';

const CONTENT_TITLE = 'Tử vi là gì';
const PENDING_TEXT = 'Đang tải…';

interface Gate {
  readonly promise: Promise<void>;
  readonly open: () => void;
}

class FirstLoadError extends Error {
  constructor() {
    super('The first route failed to load');
    this.name = 'FirstLoadError';
  }
}

function createGate(): Gate {
  let open: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { promise, open };
}

function createSlowRouter(gate: Gate): AnyRouter {
  const rootRoute = createRootRoute();
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    loader: () => gate.promise,
    pendingMs: 0,
    pendingComponent: () => <p>{PENDING_TEXT}</p>,
    component: () => <h1>{CONTENT_TITLE}</h1>,
  });
  return createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
}

describe('renderAfterFirstLoad', () => {
  it('waits for the first route to load before rendering the app', async () => {
    const gate = createGate();
    const renderApp = jest.fn();

    const started = renderAfterFirstLoad(createSlowRouter(gate), renderApp);
    await Promise.resolve();
    expect(renderApp).not.toHaveBeenCalled();

    gate.open();
    await started;
    expect(renderApp).toHaveBeenCalledTimes(1);
  });

  it('shows the first route content in the first render instead of its pending component', async () => {
    const gate = createGate();
    const router = createSlowRouter(gate);
    const pendingSeen = jest.fn();
    const renderApp = (): void => {
      render(<RouterProvider router={router} />);
      if (screen.queryByText(PENDING_TEXT)) {
        pendingSeen();
      }
    };

    const started = renderAfterFirstLoad(router, renderApp);
    gate.open();
    await act(() => started);

    expect(screen.getByRole('heading', { name: CONTENT_TITLE })).toBeTruthy();
    expect(pendingSeen).not.toHaveBeenCalled();
  });

  it('still renders the app when the first load fails, and reports the failure', async () => {
    const failure = new FirstLoadError();
    const renderApp = jest.fn();

    await expect(
      renderAfterFirstLoad({ load: () => Promise.reject(failure) }, renderApp),
    ).rejects.toBe(failure);
    expect(renderApp).toHaveBeenCalledTimes(1);
  });
});
