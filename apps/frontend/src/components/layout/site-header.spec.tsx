import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { ChapterTone, StoryChapter, StoryProvider } from '@/design-system';
import { preloadAuthModal } from '@/features/auth/lazy-auth-modal';
import { useAuthStore } from '@/stores/auth-store';
import { SiteHeader } from './site-header';

const mockUserMenuLoaded = jest.fn();

jest.mock('./user-menu', () => {
  mockUserMenuLoaded();
  return jest.requireActual('./user-menu');
});

jest.mock('@/features/auth/lazy-auth-modal', () => ({
  preloadAuthModal: jest.fn(),
}));

const SIGNED_IN_USER = { email: 'jane@example.com', avatar: null };

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
    jest.mocked(preloadAuthModal).mockClear();
    useAuthStore.setState({ user: null, isInitializing: false });
  });

  it('leaves the user menu code unloaded for a signed-out visitor', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);

    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeTruthy();
    expect(mockUserMenuLoaded).not.toHaveBeenCalled();
  });

  it('shows the signed-out login button while the session is still being checked', async () => {
    useAuthStore.setState({ user: null, isInitializing: true });

    await renderAt('/ngay-tot', () => <SiteHeader />);

    const loginButton = screen.getByRole<HTMLButtonElement>('button', { name: /đăng nhập/i });
    expect(loginButton.disabled).toBe(true);
    expect(loginButton.className.split(' ')).toEqual(
      expect.arrayContaining(['disabled:cursor-wait', 'disabled:opacity-60']),
    );
    expect(loginButton.className.split(' ')).not.toContain('hover:bg-current/10');
    expect(screen.queryByText('Loading session...')).toBeNull();
  });

  it('keeps the login button box unchanged once the session check finds no user', async () => {
    useAuthStore.setState({ user: null, isInitializing: true });
    await renderAt('/ngay-tot', () => <SiteHeader />);
    const checkingButton = screen.getByRole<HTMLButtonElement>('button', { name: /đăng nhập/i });
    const checkingClassName = checkingButton.className;

    await act(async () => {
      useAuthStore.setState({ isInitializing: false });
    });

    const signedOutButton = screen.getByRole<HTMLButtonElement>('button', { name: /đăng nhập/i });
    expect(signedOutButton).toBe(checkingButton);
    expect(signedOutButton.className).toBe(checkingClassName);
    expect(signedOutButton.disabled).toBe(false);
  });

  it('fills the session slot with the placeholder until the user menu arrives', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);
    const sessionSlot = screen.getByRole('button', { name: /đăng nhập/i }).parentElement;
    if (sessionSlot === null) {
      throw new Error('The login button has no session slot around it');
    }
    const slotTexts: string[] = [];
    const observer = new MutationObserver(() => {
      slotTexts.push(sessionSlot.textContent ?? '');
    });
    observer.observe(sessionSlot, { childList: true, subtree: true, characterData: true });

    await act(async () => {
      useAuthStore.setState({ user: SIGNED_IN_USER });
    });
    observer.disconnect();

    expect(await screen.findByRole('button', { name: /jane@example.com/ })).toBeTruthy();
    expect(slotTexts).toContain('Loading session...');
    expect(slotTexts).not.toContain('');
    expect(mockUserMenuLoaded).toHaveBeenCalled();
  });

  it('starts loading the sign-in modal when the login button is hovered', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);
    expect(preloadAuthModal).not.toHaveBeenCalled();

    fireEvent.mouseEnter(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => expect(preloadAuthModal).toHaveBeenCalled());
  });

  it('starts loading the sign-in modal when the login button takes keyboard focus', async () => {
    await renderAt('/ngay-tot', () => <SiteHeader />);

    fireEvent.focus(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => expect(preloadAuthModal).toHaveBeenCalled());
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

  it('tints the fixed header over a painting without a backdrop blur', async () => {
    await renderAt('/', StoryPage);
    mockHeaderBottom(50);

    await scrollTo({ 'mo-dau': -100, 'hieu-dung': 700, 'cau-chuyen': 1500 });

    const { className } = screen.getByRole('banner');
    expect(className).toMatch(/(^|\s)bg-night\/\d+(\s|$)/);
    expect(className).not.toContain('backdrop-blur');
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
