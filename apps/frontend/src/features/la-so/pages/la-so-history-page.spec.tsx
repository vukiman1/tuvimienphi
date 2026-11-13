import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { LaSoHistoryPage } from './la-so-history-page';

const LEAD = 'Những lá số bạn đã lập hoặc mở gần đây.';

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

async function renderPage(): Promise<ReturnType<typeof render>> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rootRoute = createRootRoute({ component: LaSoHistoryPage });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/la-so'] }),
  });
  await router.load();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Lá số đã xem' });
  return view;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('LaSoHistoryPage', () => {
  it('opens with a Night hero holding the only h1', async () => {
    await renderPage();
    const band = screen.getByRole('heading', { level: 1 }).closest('section');

    expect(classTokens(band)).toContain('bg-night');
    expect(band?.contains(screen.getByText(LEAD))).toBe(true);
  });

  it('the new-chart link is a gold CTA to the home page', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: 'Lập lá số mới' });

    expect(link.getAttribute('href')).toBe('/');
    expect(classTokens(link)).toContain('bg-gold');
  });

  it('keeps the motto footer without raster art', async () => {
    const { container } = await renderPage();

    expect(screen.getByText('THIÊN THỜI · ĐỊA LỢI · NHÂN HÒA')).toBeTruthy();
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
