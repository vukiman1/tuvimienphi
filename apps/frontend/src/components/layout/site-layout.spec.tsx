import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { ChapterTone, StoryChapter } from '@/design-system';
import { useAuthStore } from '@/stores/auth-store';
import { SiteLayout } from './site-layout';

function ChapterPage() {
  return (
    <StoryChapter id="mo-dau" tone={ChapterTone.Night} label="Mở đầu">
      Mở đầu
    </StoryChapter>
  );
}

async function renderPage(isStoryPage: boolean): Promise<void> {
  const rootRoute = createRootRoute({ component: SiteLayout });
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: ChapterPage,
    staticData: { isStoryPage },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByText('Mở đầu');
}

function rectFrom(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 100,
    width: 100,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

async function scrollNightChapterUnderHeader(): Promise<void> {
  const chapter = document.getElementById('mo-dau');
  if (chapter === null) {
    throw new Error('The chapter #mo-dau is missing');
  }
  jest.spyOn(chapter, 'getBoundingClientRect').mockReturnValue(rectFrom(-100, 700));
  jest.spyOn(screen.getByRole('banner'), 'getBoundingClientRect').mockReturnValue(rectFrom(0, 50));
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  });
}

describe('SiteLayout', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isInitializing: false });
  });

  it('puts the header over the story on a route marked as a story page', async () => {
    await renderPage(true);

    expect(screen.getByRole('banner').className).toContain('fixed');
  });

  it('closes a story page with a night footer', async () => {
    await renderPage(true);
    expect(screen.getByRole('contentinfo').className).toContain('bg-night');
  });

  it('keeps the day footer on routes that are not a story', async () => {
    await renderPage(false);
    expect(screen.getByRole('contentinfo').className).toContain('bg-day');
  });

  it('shows the footer and its Kiến Thức link on phones too', async () => {
    await renderPage(false);

    const footer = screen.getByRole('contentinfo');
    const hiddenAncestor = footer.closest('.hidden');

    expect(hiddenAncestor).toBeNull();
    expect(
      within(screen.getByRole('navigation', { name: 'Footer' })).getByRole('link', {
        name: 'Kiến Thức',
      }),
    ).toBeTruthy();
  });

  it('keeps the phone header on one row with a tighter gap', async () => {
    await renderPage(false);

    const row = screen.getByRole('banner').querySelector('div');

    expect(row?.className).toContain('gap-x-3');
    expect(row?.className).not.toMatch(/(^|\s)gap-x-6(\s|$)/);
  });

  it('keeps the solid header on other routes, even if they render chapters', async () => {
    await renderPage(false);
    await scrollNightChapterUnderHeader();

    const { className } = screen.getByRole('banner');
    expect(className).not.toContain('fixed');
    expect(className).toContain('bg-day');
    expect(className).toContain('text-ink');
    for (const link of within(screen.getByRole('navigation', { name: 'Primary' })).getAllByRole(
      'link',
    )) {
      expect(link.className).not.toContain('text-day');
    }
  });
});
