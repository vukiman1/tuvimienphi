import type { ReactElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  Link,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { TextLink } from '@/design-system';
import { focusHashTargetOnRender } from './focus-hash-target-on-render';

const FORM_ID = 'lap-la-so';
const FORM_NAME = 'Lập lá số của bạn';
const SETTLE_MS = 100;

interface Gate {
  readonly promise: Promise<void>;
  readonly open: () => void;
}

function createGate(): Gate {
  let open: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { promise, open };
}

function openedGate(): Gate {
  const gate = createGate();
  gate.open();
  return gate;
}

function HomePage(): ReactElement {
  return (
    <>
      <TextLink to="/" hash={FORM_ID}>
        Mở form
      </TextLink>
      <section id={FORM_ID} tabIndex={-1} aria-label={FORM_NAME}>
        Form
      </section>
    </>
  );
}

function KnowledgePage(): ReactElement {
  return (
    <>
      <TextLink to="/" hash={FORM_ID}>
        Lập lá số
      </TextLink>
      <Link to="/">Trang chủ</Link>
    </>
  );
}

function renderAt(path: string, homeLoad: Gate): void {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    loader: () => homeLoad.promise,
    component: HomePage,
  });
  const knowledgeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/kien-thuc',
    component: KnowledgePage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, knowledgeRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  focusHashTargetOnRender(router);
  render(<RouterProvider router={router} />);
}

async function settle(): Promise<void> {
  await act(() => new Promise((resolve) => setTimeout(resolve, SETTLE_MS)));
}

describe('focusing the hash target after a navigation renders', () => {
  it('focuses the form once the page it lives on has loaded', async () => {
    const homeLoad = createGate();
    renderAt('/kien-thuc', homeLoad);

    fireEvent.click(await screen.findByRole('link', { name: 'Lập lá số' }));
    await settle();
    act(() => homeLoad.open());

    const form = await screen.findByRole('region', { name: FORM_NAME });
    await settle();
    expect(document.activeElement).toBe(form);
  });

  it('leaves focus alone when a later navigation without a hash wins', async () => {
    const homeLoad = createGate();
    renderAt('/kien-thuc', homeLoad);

    fireEvent.click(await screen.findByRole('link', { name: 'Lập lá số' }));
    fireEvent.click(screen.getByRole('link', { name: 'Trang chủ' }));
    await settle();
    act(() => homeLoad.open());

    const form = await screen.findByRole('region', { name: FORM_NAME });
    await settle();
    expect(document.activeElement).not.toBe(form);
  });

  it('focuses the form when the page is opened straight at its hash', async () => {
    renderAt(`/#${FORM_ID}`, openedGate());

    const form = await screen.findByRole('region', { name: FORM_NAME });
    await settle();
    expect(document.activeElement).toBe(form);
  });

  it('focuses the form when a link on the same page points at it', async () => {
    renderAt('/', openedGate());

    fireEvent.click(await screen.findByRole('link', { name: 'Mở form' }));
    await settle();

    expect(document.activeElement).toBe(screen.getByRole('region', { name: FORM_NAME }));
  });

  it('focuses the form again when the link is used a second time at the same address', async () => {
    renderAt(`/#${FORM_ID}`, openedGate());
    const form = await screen.findByRole('region', { name: FORM_NAME });
    await settle();
    act(() => form.blur());

    fireEvent.click(screen.getByRole('link', { name: 'Mở form' }));
    await settle();

    expect(document.activeElement).toBe(form);
  });
});
