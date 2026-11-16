import type { ReactElement } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import type { VanHanCurrent } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { TY_ENTRY, VAN_HAN_CURRENT } from '../__fixtures__/van-han-current';
import { vanHanZodiacHead } from '../van-han-zodiac-head';
import { VanHanZodiacPage } from './van-han-zodiac-page';

const HREF_BASE = 'https://x';
const ZODIAC_COUNT = 12;

function RootLayout(): ReactElement {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}

interface ZodiacPageSetup {
  readonly current: VanHanCurrent | null;
  readonly publishedYears?: readonly number[];
  readonly yearInPath?: number;
}

function renderZodiacPage(
  path: string,
  { current, publishedYears = [VAN_HAN_CURRENT.year], yearInPath }: ZodiacPageSetup,
): void {
  const rootRoute = createRootRoute({ component: RootLayout });
  const zodiacRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/van-han/$slug',
    loader: () => current,
    head: ({ loaderData }) => vanHanZodiacHead('Tý', loaderData ?? null),
    component: ZodiacRoute,
  });
  const yearZodiacRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/van-han/$year/$slug',
    component: ZodiacRoute,
  });
  function ZodiacRoute(): ReactElement {
    return (
      <VanHanZodiacPage
        chi="Tý"
        current={current}
        publishedYears={publishedYears}
        yearInPath={yearInPath}
      />
    );
  }
  const router = createRouter({
    routeTree: rootRoute.addChildren([zodiacRoute, yearZodiacRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
}

function pathOf(link: HTMLElement): string {
  return new URL(link.getAttribute('href') ?? '', HREF_BASE).pathname;
}

describe('VanHanZodiacPage', () => {
  it('heads the page with the published reading and its overview', async () => {
    renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

    expect(await screen.findByRole('heading', { level: 1, name: TY_ENTRY.title })).toBeTruthy();
    expect(screen.getByText(/Năm nay, tuổi Tý nên chú trọng sức khỏe/)).toBeTruthy();
    await waitFor(() => expect(document.title).toBe(`${TY_ENTRY.title} | Tử Vi Miễn Phí`));
  });

  it('links every con giáp to its own page and marks the one being read', async () => {
    renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

    const picker = await screen.findByRole('navigation', { name: 'Chọn con giáp' });
    const links = within(picker).getAllByRole('link');
    expect(links).toHaveLength(ZODIAC_COUNT);
    expect(links.map(pathOf)).toContain('/van-han/tuoi-hoi');
    expect(pathOf(within(picker).getByRole('link', { current: 'page' }))).toBe('/van-han/tuoi-ty');
  });

  it('points to the same con giáp in the Tết 2027 hub', async () => {
    renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

    const hubLink = await screen.findByRole('link', { name: /Tử vi 2027 tuổi Tý/ });
    expect(pathOf(hubLink)).toBe('/kien-thuc/tu-vi-2027/tuoi-ty');
  });

  it('keeps the con giáp links on the year being read', async () => {
    renderZodiacPage('/van-han/2026/tuoi-ty', { current: VAN_HAN_CURRENT, yearInPath: 2026 });

    const picker = await screen.findByRole('navigation', { name: 'Chọn con giáp' });
    expect(within(picker).getAllByRole('link').map(pathOf)).toContain('/van-han/2026/tuoi-hoi');
    expect(pathOf(within(picker).getByRole('link', { current: 'page' }))).toBe(
      '/van-han/2026/tuoi-ty',
    );
  });

  it('links the same con giáp in the other published years', async () => {
    renderZodiacPage('/van-han/tuoi-ty', {
      current: VAN_HAN_CURRENT,
      publishedYears: [2028, 2027, 2026],
    });

    const years = await screen.findByRole('navigation', { name: 'Năm khác' });
    expect(within(years).getAllByRole('link').map(pathOf)).toEqual([
      '/van-han/2028/tuoi-ty',
      '/van-han/2027/tuoi-ty',
    ]);
    expect(within(years).getByText('2026').getAttribute('aria-current')).toBe('true');
  });

  it('offers no other year while only one is published', async () => {
    renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

    await screen.findByRole('heading', { level: 1, name: TY_ENTRY.title });
    expect(screen.queryByRole('navigation', { name: 'Năm khác' })).toBeNull();
  });

  it('says the reading is not out yet when no year is published', async () => {
    renderZodiacPage('/van-han/tuoi-ty', { current: null, publishedYears: [] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Vận hạn tuổi Tý' })).toBeTruthy();
    expect(screen.getByText(/chưa được cập nhật/)).toBeTruthy();
  });

  describe('in D3', () => {
    function classTokens(element: Element | null): readonly string[] {
      return element?.getAttribute('class')?.split(/\s+/) ?? [];
    }

    async function heroSection(): Promise<HTMLElement> {
      const title = await screen.findByRole('heading', { level: 1 });
      const section = title.closest('section');
      expect(section).not.toBeNull();
      return section ?? document.body;
    }

    function dayZoneOf(element: Element): Element | null {
      return element.closest('section.bg-day');
    }

    it('opens with a Night hero holding the title, the way back and the Tết link', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

      const hero = await heroSection();
      expect(classTokens(hero)).toContain('bg-night');
      for (const name of ['← Vận hạn 12 con giáp', 'Tử vi 2027 tuổi Tý']) {
        expect(classTokens(within(hero).getByRole('link', { name }))).toEqual(
          expect.arrayContaining(FOCUS_RING_CLASS.split(' ')),
        );
      }
    });

    it('states the con giáp, the year and the birth years in the hero', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

      const hero = await heroSection();
      for (const fact of [
        'Tuổi Tý',
        'Vận hạn năm Bính Ngọ 2026',
        'Sinh năm: 1972, 1984, 1996, 2008, 2020',
      ]) {
        expect(screen.getAllByText(fact)).toHaveLength(1);
        expect(hero.contains(screen.getByText(fact))).toBe(true);
      }
    });

    it('drops the fact separators on phones so no wrapped line starts with a dot', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

      const hero = await heroSection();
      const separators = within(hero).getAllByText('·');
      expect(separators).toHaveLength(2);
      for (const separator of separators) {
        expect(classTokens(separator)).toEqual(expect.arrayContaining(['hidden', 'sm:inline']));
        expect(separator.getAttribute('aria-hidden')).toBe('true');
      }
    });

    it('switches years from pills in the hero', async () => {
      renderZodiacPage('/van-han/tuoi-ty', {
        current: VAN_HAN_CURRENT,
        publishedYears: [2028, 2027, 2026],
      });

      const hero = await heroSection();
      const years = within(hero).getByRole('navigation', { name: 'Năm khác' });
      const links = within(years).getAllByRole('link');
      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(classTokens(link)).toEqual(
          expect.arrayContaining(['min-h-11', 'border', 'border-day-soft']),
        );
      }
      const shown = within(years).getByText('2026');
      expect(shown.hasAttribute('href')).toBe(false);
      expect(classTokens(shown)).toEqual(expect.arrayContaining(['bg-gold', 'text-ink']));
      expect(shown.getAttribute('aria-current')).toBe('true');
    });

    it('sets the reading on a Day zone below the hero', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

      const hero = await heroSection();
      const overviewTitle = screen.getByRole('heading', { name: 'Lưu Niên Vận Thế' });
      expect(dayZoneOf(overviewTitle)).not.toBeNull();
      expect(hero.contains(overviewTitle)).toBe(false);
    });

    it('puts the con giáp picker after the readings', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

      const picker = await screen.findByRole('navigation', { name: 'Chọn con giáp' });
      const lastReading = screen.getByRole('heading', { name: 'Vận Hạn Từng Tuổi' });
      expect(
        lastReading.compareDocumentPosition(picker) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('keeps the not-published note on the Day zone with no facts in the hero', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: null, publishedYears: [] });

      const hero = await heroSection();
      expect(dayZoneOf(screen.getByText(/chưa được cập nhật/))).not.toBeNull();
      expect(within(hero).queryByText(/Sinh năm/)).toBeNull();
      expect(screen.queryByRole('navigation', { name: 'Năm khác' })).toBeNull();
    });

    it('loads no image but the con giáp emblems', async () => {
      renderZodiacPage('/van-han/tuoi-ty', { current: VAN_HAN_CURRENT });

      await heroSection();
      const images = Array.from(document.querySelectorAll('img'));
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        expect(image.getAttribute('src')).toContain('/tet/emblem/');
      }
    });
  });
});
