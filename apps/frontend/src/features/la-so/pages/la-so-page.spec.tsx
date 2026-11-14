import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { birthSearchSchema } from '@/features/la-so/birth-input';
import { LaSoPage } from './la-so-page';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(() => new Promise(() => undefined)), post: jest.fn() },
}));

const SAMPLE_SEARCH = '?day=12&month=3&year=1995&calendar=duong&hour=Ng%E1%BB%8D&gender=nam';
const LUAN_GIAI_TITLE = 'Luận giải lá số';

interface RenderedLaSoPage {
  readonly view: ReturnType<typeof render>;
  readonly currentSearch: () => Readonly<Record<string, unknown>>;
}

async function renderLaSoPage(search: string): Promise<RenderedLaSoPage> {
  const rootRoute = createRootRoute();
  const siteRoute = createRoute({ getParentRoute: () => rootRoute, id: '_site' });
  const laSoRoute = createRoute({
    getParentRoute: () => siteRoute,
    path: 'la-so',
    validateSearch: birthSearchSchema,
  });
  const detailRoute = createRoute({
    getParentRoute: () => laSoRoute,
    path: 'detail',
    component: LaSoPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      siteRoute.addChildren([laSoRoute.addChildren([detailRoute])]),
    ]),
    history: createMemoryHistory({ initialEntries: [`/la-so/detail${search}`] }),
  });
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Lá Số Tử Vi' });
  return { view, currentSearch: () => router.state.location.search };
}

function cungButton(name: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`^Cung ${name}$`, 'i') });
}

function isPicked(name: string): boolean {
  return cungButton(name).getAttribute('aria-pressed') === 'true';
}

function follows(later: Node, earlier: Node): boolean {
  return (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('LaSoPage', () => {
  it('stacks the hero, the board and luận giải in that order', async () => {
    await renderLaSoPage(SAMPLE_SEARCH);
    const title = screen.getByRole('heading', { level: 1 });
    const firstCung = screen.getAllByRole('button', { name: /^Cung / })[0];
    const luanGiai = screen.getByRole('heading', { level: 2, name: LUAN_GIAI_TITLE });

    expect(follows(firstCung, title)).toBe(true);
    expect(follows(luanGiai, firstCung)).toBe(true);
  });

  it('picks Mệnh when the URL names no cung', async () => {
    await renderLaSoPage(SAMPLE_SEARCH);

    expect(isPicked('Mệnh')).toBe(true);
  });

  it('picks the cung named in the URL', async () => {
    await renderLaSoPage(`${SAMPLE_SEARCH}&cung=quan-loc`);

    expect(isPicked('Quan Lộc')).toBe(true);
    expect(isPicked('Mệnh')).toBe(false);
  });

  it('falls back to Mệnh on a bad slug', async () => {
    await renderLaSoPage(`${SAMPLE_SEARCH}&cung=abc`);

    expect(isPicked('Mệnh')).toBe(true);
  });

  it('writes the picked cung into the URL', async () => {
    const { currentSearch } = await renderLaSoPage(SAMPLE_SEARCH);
    fireEvent.click(cungButton('Tài Bạch'));

    await waitFor(() => expect(currentSearch().cung).toBe('tai-bach'));
    expect(isPicked('Tài Bạch')).toBe(true);
  });

  it('drops the decor paintings beside the board', async () => {
    const {
      view: { container },
    } = await renderLaSoPage(SAMPLE_SEARCH);
    const luanGiaiBand = screen
      .getByRole('heading', { level: 2, name: LUAN_GIAI_TITLE })
      .closest('section');
    const heroBand = screen.getByRole('heading', { level: 1 }).closest('section');

    for (const image of container.querySelectorAll('img')) {
      expect(luanGiaiBand?.contains(image) || heroBand?.contains(image)).toBe(true);
    }
  });

  it('paints only the hero', async () => {
    const {
      view: { container },
    } = await renderLaSoPage(SAMPLE_SEARCH);

    const heroBand = screen.getByRole('heading', { level: 1 }).closest('section');

    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(heroBand?.querySelectorAll('img')).toHaveLength(1);
  });
});
