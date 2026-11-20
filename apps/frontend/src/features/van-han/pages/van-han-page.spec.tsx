import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type AnyRouter,
} from '@tanstack/react-router';
import { CalendarType, Gender, type VanHanCurrent, type VanHanEntry } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { recordLocalHistory } from '@/features/la-so/history/local-history-store';
import { TY_ENTRY } from '../__fixtures__/van-han-current';
import { REMEMBERED_ZODIAC_STORAGE_KEY } from '../remembered-zodiac';
import { VanHanPage } from './van-han-page';

const HREF_BASE = 'https://x';
const ZODIAC_COUNT = 12;
const PICKER_LABEL = 'Chọn con giáp';

const NGO_ENTRY: VanHanEntry = {
  ...TY_ENTRY,
  zodiac: 'Ngọ',
  zodiacOrder: 7,
  title: 'Vận hạn tuổi Ngọ năm Bính Ngọ 2026',
  bornYears: [1966, 1978, 1990, 2002, 2014],
  luuNien:
    'Người tuổi Ngọ gặp năm tuổi, cần giữ nhịp chậm mà chắc.\nĐoạn thứ hai chỉ có ở trang đầy đủ.',
};

const CURRENT: VanHanCurrent = { year: 2026, entries: [TY_ENTRY, NGO_ENTRY] };

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function pathOf(link: Element): string {
  return new URL(link.getAttribute('href') ?? '', HREF_BASE).pathname;
}

interface PageData {
  readonly current?: VanHanCurrent | null;
  readonly publishedYears?: readonly number[];
}

function createPageRouter({
  current = CURRENT,
  publishedYears = [CURRENT.year],
}: PageData = {}): AnyRouter {
  const page = <VanHanPage current={current} publishedYears={publishedYears} />;
  const rootRoute = createRootRoute({ component: Outlet });
  const routes = ['/van-han', '/van-han/$slug', '/van-han/$year/$slug'].map((routePath) =>
    createRoute({ getParentRoute: () => rootRoute, path: routePath, component: () => page }),
  );
  return createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: ['/van-han'] }),
  });
}

function renderPage(data: PageData = {}): AnyRouter {
  const router = createPageRouter(data);
  render(<RouterProvider router={router} />);
  return router;
}

async function prerenderPage(): Promise<HTMLElement> {
  const router = createPageRouter();
  await router.load();
  const container = document.createElement('div');
  container.innerHTML = renderToString(<RouterProvider router={router} />);
  document.body.append(container);
  return container;
}

async function heroSection(): Promise<HTMLElement> {
  const title = await screen.findByRole('heading', { level: 1 });
  const section = title.closest('section');
  expect(section).not.toBeNull();
  return section ?? document.body;
}

function selectedTabName(scope: HTMLElement): string | null {
  return within(scope).getByRole('tab', { selected: true }).textContent;
}

function panelHeading(scope: HTMLElement): string | null {
  return within(within(scope).getByRole('tabpanel')).getByRole('heading', { level: 2 }).textContent;
}

function rememberInBrowser(value: string): void {
  window.localStorage.setItem(REMEMBERED_ZODIAC_STORAGE_KEY, value);
}

function recordChartBornIn1985BeforeTet(): void {
  recordLocalHistory({
    day: 20,
    month: 1,
    year: 1985,
    calendar: CalendarType.Solar,
    hour: 'Ngọ',
    gender: Gender.Female,
  });
}

let hydratedRoot: Root | undefined;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  act(() => hydratedRoot?.unmount());
  hydratedRoot = undefined;
  jest.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('VanHanPage', () => {
  it('opens with a Night hero holding the only h1', async () => {
    renderPage();

    const hero = await heroSection();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Vận Hạn');
    expect(classTokens(hero)).toContain('bg-night');
    expect(
      within(hero).getByText('Chọn con giáp để xem sao chiếu mệnh và vận hạn trong năm theo tuổi.'),
    ).toBeTruthy();
  });

  it('accents Hạn in the h1', async () => {
    renderPage();

    const accent = (await screen.findByRole('heading', { level: 1 })).querySelector('.italic');
    expect(accent?.textContent).toBe('Hạn');
    expect(classTokens(accent)).toContain('text-dawn');
  });

  it('links the Tết hub from the hero', async () => {
    renderPage();

    const hubLink = within(await heroSection()).getByRole('link', {
      name: 'Tử vi 2027 theo tuổi',
    });
    expect(pathOf(hubLink)).toBe('/kien-thuc/tu-vi-2027');
    expect(classTokens(hubLink)).toEqual(
      expect.arrayContaining(['min-h-11', ...FOCUS_RING_CLASS.split(' ')]),
    );
  });

  it('paints the hero from tablet width as a lazy decorative image phones never show', async () => {
    renderPage();

    const painting = (await heroSection()).querySelector('img');
    expect(painting?.getAttribute('alt')).toBe('');
    expect(painting?.getAttribute('loading')).toBe('lazy');
    expect(painting?.getAttribute('srcset')).toBe(
      '/van-han/hero-night-768.webp 768w, /van-han/hero-night-1536.webp 1536w',
    );
    expect(classTokens(painting)).toEqual(expect.arrayContaining(['hidden', 'md:block']));
  });

  it('lists the 12 con giáp as tabs on a Day zone below the hero', async () => {
    renderPage();

    const hero = await heroSection();
    const tabs = screen.getByRole('tablist', { name: PICKER_LABEL });
    expect(within(tabs).getAllByRole('tab')).toHaveLength(ZODIAC_COUNT);
    expect(classTokens(tabs.closest('section'))).toContain('bg-day');
    expect(hero.contains(tabs)).toBe(false);
  });

  it('prerenders the con giáp of the published year, whatever the browser remembers', async () => {
    rememberInBrowser('Tý');

    const prerendered = await prerenderPage();

    expect(selectedTabName(prerendered)).toBe('Ngọ');
    expect(panelHeading(prerendered)).toBe('Tuổi Ngọ');
  });

  it('switches to the remembered tuổi once hydrated, without a hydration error', async () => {
    const prerendered = await prerenderPage();
    rememberInBrowser('Tý');
    const router = createPageRouter();
    await router.load();
    const onRecoverableError = jest.fn();
    const consoleError = jest.spyOn(console, 'error');

    await act(async () => {
      hydratedRoot = hydrateRoot(prerendered, <RouterProvider router={router} />, {
        onRecoverableError,
      });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(selectedTabName(prerendered)).toBe('Tý');
    expect(panelHeading(prerendered)).toBe('Tuổi Tý');
  });

  it('falls back to the tuổi of the latest lá số when nothing is remembered', async () => {
    recordChartBornIn1985BeforeTet();

    renderPage();

    expect(selectedTabName(await screen.findByRole('tablist'))).toBe('Tý');
  });

  it('prefers the remembered tuổi over the lá số history', async () => {
    rememberInBrowser('Dần');
    recordChartBornIn1985BeforeTet();

    renderPage();

    expect(selectedTabName(await screen.findByRole('tablist'))).toBe('Dần');
  });

  it('ignores a remembered value that is not a con giáp', async () => {
    rememberInBrowser('Rồng');

    renderPage();

    expect(selectedTabName(await screen.findByRole('tablist'))).toBe('Ngọ');
  });

  it('selects a con giáp in place on a plain click and remembers it', async () => {
    const router = renderPage();
    const tabs = await screen.findByRole('tablist');

    fireEvent.click(within(tabs).getByRole('tab', { name: 'Tý' }));

    expect(router.state.location.pathname).toBe('/van-han');
    expect(selectedTabName(tabs)).toBe('Tý');
    expect(panelHeading(document.body)).toBe('Tuổi Tý');
    expect(screen.getByText(/Người tuổi Tý bước vào năm 2026/)).toBeTruthy();
    expect(window.localStorage.getItem(REMEMBERED_ZODIAC_STORAGE_KEY)).toBe('Tý');
  });

  it.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
  ])('leaves a %s-click to the browser so the zodiac page opens', async (_, modifier) => {
    const router = renderPage();
    const tabs = await screen.findByRole('tablist');
    const tyTab = within(tabs).getByRole('tab', { name: 'Tý' });

    const isNotPrevented = fireEvent.click(tyTab, modifier);

    expect(isNotPrevented).toBe(true);
    expect(pathOf(tyTab)).toBe('/van-han/tuoi-ty');
    expect(router.state.location.pathname).toBe('/van-han');
    expect(selectedTabName(tabs)).toBe('Ngọ');
    expect(window.localStorage.getItem(REMEMBERED_ZODIAC_STORAGE_KEY)).toBeNull();
  });

  it('moves the selection with the arrow keys', async () => {
    renderPage();
    const tabs = await screen.findByRole('tablist');

    fireEvent.keyDown(within(tabs).getByRole('tab', { name: 'Ngọ' }), { key: 'ArrowRight' });

    expect(selectedTabName(tabs)).toBe('Mùi');
    expect(document.activeElement?.textContent).toBe('Mùi');
  });

  it('wraps from Tý back to Hợi with the left arrow', async () => {
    rememberInBrowser('Tý');
    renderPage();
    const tabs = await screen.findByRole('tablist');

    fireEvent.keyDown(within(tabs).getByRole('tab', { name: 'Tý' }), { key: 'ArrowLeft' });

    expect(selectedTabName(tabs)).toBe('Hợi');
  });

  it.each([
    ['Home', 'Tý'],
    ['End', 'Hợi'],
  ])('jumps with %s to %s', async (key, expected) => {
    renderPage();
    const tabs = await screen.findByRole('tablist');

    fireEvent.keyDown(within(tabs).getByRole('tab', { name: 'Ngọ' }), { key });

    expect(selectedTabName(tabs)).toBe(expected);
    expect(document.activeElement?.textContent).toBe(expected);
  });

  it('ignores arrow keys held with a browser shortcut modifier', async () => {
    renderPage();
    const tabs = await screen.findByRole('tablist');

    const isNotPrevented = fireEvent.keyDown(within(tabs).getByRole('tab', { name: 'Ngọ' }), {
      key: 'ArrowRight',
      altKey: true,
    });

    expect(isNotPrevented).toBe(true);
    expect(selectedTabName(tabs)).toBe('Ngọ');
  });

  it('opens on Tý with a not-yet-published note when no year is published', async () => {
    renderPage({ current: null, publishedYears: [] });

    const tabs = await screen.findByRole('tablist');
    expect(selectedTabName(tabs)).toBe('Tý');
    expect(within(screen.getByRole('tabpanel')).getByText(/chưa được cập nhật/)).toBeTruthy();
  });

  it('keeps the real zodiac page href on every con giáp', async () => {
    renderPage();

    const tabs = await screen.findByRole('tablist');

    expect(within(tabs).getAllByRole('tab').map(pathOf)).toContain('/van-han/tuoi-hoi');
    expect(pathOf(within(tabs).getByRole('tab', { name: 'Tý' }))).toBe('/van-han/tuoi-ty');
  });

  it('summarises the selected reading and links to the full page', async () => {
    renderPage();

    const panel = await screen.findByRole('tabpanel');
    expect(within(panel).getByText('Sinh năm: 1966, 1978, 1990, 2002, 2014')).toBeTruthy();
    expect(within(panel).getByText(/Người tuổi Ngọ gặp năm tuổi/)).toBeTruthy();
    expect(within(panel).queryByText(/Đoạn thứ hai/)).toBeNull();
    const fullLink = within(panel).getByRole('link', { name: 'Xem đầy đủ vận hạn tuổi Ngọ' });
    expect(pathOf(fullLink)).toBe('/van-han/tuoi-ngo');
    expect(within(panel).queryByRole('link', { name: /năm 2027/ })).toBeNull();
  });

  it('links the next year of the selected tuổi once that year is published', async () => {
    renderPage({ publishedYears: [2027, 2026] });

    const panel = await screen.findByRole('tabpanel');
    const nextYear = within(panel).getByRole('link', { name: 'Vận hạn tuổi Ngọ năm 2027' });
    expect(pathOf(nextYear)).toBe('/van-han/2027/tuoi-ngo');
  });
});
