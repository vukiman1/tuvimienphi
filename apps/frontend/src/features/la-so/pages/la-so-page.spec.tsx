import { fireEvent, render, screen } from '@testing-library/react';
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

async function renderLaSoPage(search: string): Promise<ReturnType<typeof render>> {
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
  return view;
}

function pickedCungLine(name: string): HTMLElement {
  return screen.getByText(
    (_, element) =>
      element?.tagName === 'P' &&
      new RegExp(`^Đang chọn cung ${name} ·`, 'i').test(element.textContent ?? ''),
  );
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

  it('names the picked cung under the board, Mệnh first', async () => {
    await renderLaSoPage(SAMPLE_SEARCH);
    expect(pickedCungLine('Mệnh')).toBeTruthy();

    const [other] = screen
      .getAllByRole('button', { name: /^Cung / })
      .filter((button) => button.getAttribute('aria-pressed') === 'false');
    const otherName = (other.getAttribute('aria-label') ?? '').replace(/^Cung /, '');
    fireEvent.click(other);

    expect(pickedCungLine(otherName)).toBeTruthy();
  });

  it('drops the decor paintings beside the board', async () => {
    const { container } = await renderLaSoPage(SAMPLE_SEARCH);
    const luanGiaiBand = screen
      .getByRole('heading', { level: 2, name: LUAN_GIAI_TITLE })
      .closest('section');

    for (const image of container.querySelectorAll('img')) {
      expect(luanGiaiBand?.contains(image)).toBe(true);
    }
  });

  it('renders no images', async () => {
    const { container } = await renderLaSoPage(SAMPLE_SEARCH);

    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
