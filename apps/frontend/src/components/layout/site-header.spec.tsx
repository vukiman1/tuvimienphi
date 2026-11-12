import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { ChapterTone, StoryChapter, StoryProvider } from '@/design-system';
import { useAuthStore } from '@/stores/auth-store';
import { SiteHeader } from './site-header';

function rectAt(top: number): DOMRect {
  return {
    top,
    bottom: top + 800,
    left: 0,
    right: 100,
    width: 100,
    height: 800,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

async function scrollTo(tops: Readonly<Record<string, number>>): Promise<void> {
  for (const [id, top] of Object.entries(tops)) {
    const section = document.getElementById(id);
    if (section === null) {
      throw new Error(`No chapter section with id ${id}`);
    }
    jest.spyOn(section, 'getBoundingClientRect').mockReturnValue(rectAt(top));
  }
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  });
}

function mockHeaderBottom(bottom: number): void {
  jest.spyOn(screen.getByRole('banner'), 'getBoundingClientRect').mockReturnValue({
    ...rectAt(0),
    height: bottom,
    bottom,
  });
}

function StoryPage(): ReactElement {
  return (
    <StoryProvider>
      <SiteHeader isStoryPage />
      <StoryChapter id="mo-dau" tone={ChapterTone.Night} label="Mở đầu">
        Mở đầu
      </StoryChapter>
      <StoryChapter id="hieu-dung" tone={ChapterTone.Ember} label="Hiểu đúng">
        Hiểu đúng
      </StoryChapter>
      <StoryChapter id="cau-chuyen" tone={ChapterTone.Day} label="Câu chuyện của bạn">
        Câu chuyện của bạn
      </StoryChapter>
    </StoryProvider>
  );
}

async function renderAt(path: string, page: () => ReactElement): Promise<void> {
  const rootRoute = createRootRoute();
  const pageRoute = createRoute({ getParentRoute: () => rootRoute, path, component: page });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole('banner');
}

describe('SiteHeader', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isInitializing: false });
  });

  it('marks the current section with aria-current="page"', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);

    const primary = screen.getByRole('navigation', { name: 'Primary' });
    expect(
      within(primary).getByRole('link', { name: 'Ngày Tốt' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(
      within(primary).getByRole('link', { name: 'Lá Số' }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('shows the site name once to assistive technology', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);

    const banner = screen.getByRole('banner');
    expect(within(banner).getAllByRole('img', { name: 'Tử Vi Miễn Phí' })).toHaveLength(1);
    expect(within(banner).getByRole('link', { name: 'Tử Vi Miễn Phí' })).toBeTruthy();
  });

  it('is a solid day bar with ink text outside a story', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);

    const { className } = screen.getByRole('banner');
    expect(className).toContain('bg-day');
    expect(className).toContain('text-ink');
  });

  it('uses day text over a dark chapter and ink text over a light one', async () => {
    await renderAt('/', StoryPage);
    mockHeaderBottom(50);

    await scrollTo({ 'mo-dau': -100, 'hieu-dung': 700, 'cau-chuyen': 1500 });
    expect(screen.getByRole('banner').className).toContain('text-day');

    await scrollTo({ 'mo-dau': -1700, 'hieu-dung': -900, 'cau-chuyen': 0 });
    expect(screen.getByRole('banner').className).toContain('text-ink');
  });

  it('paints the background of the chapter under it, so chapter text never shows through', async () => {
    await renderAt('/', StoryPage);
    mockHeaderBottom(50);

    await scrollTo({ 'mo-dau': -100, 'hieu-dung': 700, 'cau-chuyen': 1500 });
    expect(screen.getByRole('banner').className).toContain('bg-night');

    await scrollTo({ 'mo-dau': -900, 'hieu-dung': -100, 'cau-chuyen': 700 });
    expect(screen.getByRole('banner').className).toContain('bg-ember');

    await scrollTo({ 'mo-dau': -2500, 'hieu-dung': -1700, 'cau-chuyen': -900 });
    expect(screen.getByRole('banner').className).toContain('bg-day');
  });

  it('takes its tone from the chapter under its bottom edge', async () => {
    await renderAt('/', StoryPage);
    mockHeaderBottom(90);

    await scrollTo({ 'mo-dau': -740, 'hieu-dung': 60, 'cau-chuyen': 860 });

    expect(screen.getByRole('banner').className).toContain('text-ink');
  });

  it('keeps every link in full ink over ember', async () => {
    await renderAt('/', StoryPage);
    mockHeaderBottom(50);

    await scrollTo({ 'mo-dau': -900, 'hieu-dung': -100, 'cau-chuyen': 700 });

    const inactive = within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', {
      name: 'Lá Số',
    });
    expect(inactive.className).toContain('text-ink');
    expect(inactive.className).not.toContain('text-ink-soft');
  });

  it('falls back to ink text once the story has scrolled past', async () => {
    await renderAt('/', StoryPage);
    mockHeaderBottom(50);

    await scrollTo({ 'mo-dau': -2500, 'hieu-dung': -1700, 'cau-chuyen': -900 });

    expect(screen.getByRole('banner').className).toContain('text-ink');
  });
});
