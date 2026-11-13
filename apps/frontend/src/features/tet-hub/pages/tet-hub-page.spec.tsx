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
import type { TetHubIntro } from '@org/shared-contracts';
import { CHI, conGiapSlug } from '@org/shared-tu-vi';
import { FOCUS_RING_CLASS } from '@/design-system';
import fixture from '../__fixtures__/hub.json';
import { tetHubHead } from '../tet-hub-head';
import { TetHubPage } from './tet-hub-page';

const INTRO: TetHubIntro = fixture;
const EMPTY_INTRO: TetHubIntro = { intro: [] };
const HUB_PATH = '/kien-thuc/tu-vi-2027';
const HREF_BASE = 'https://x';

function heroOf(heading: HTMLElement): HTMLElement {
  const hero = heading.closest('section');
  if (hero === null) throw new Error('The h1 is not inside a page hero section');
  return hero;
}

function RootLayout(): ReactElement {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}

function renderHub(intro: TetHubIntro): void {
  const rootRoute = createRootRoute({ component: RootLayout });
  const hubRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: HUB_PATH,
    head: tetHubHead,
    component: () => <TetHubPage intro={intro} />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([hubRoute]),
    history: createMemoryHistory({ initialEntries: [HUB_PATH] }),
  });

  render(<RouterProvider router={router} />);
}

describe('TetHubPage', () => {
  it('the hub links all twelve con giáp', async () => {
    renderHub(INTRO);

    const tiles = within(await screen.findByRole('region', { name: 'Chọn con giáp của bạn' }));
    const paths = tiles
      .getAllByRole('link')
      .map((link) => new URL(link.getAttribute('href') ?? '', HREF_BASE).pathname);

    expect(paths).toEqual(CHI.map((_, chi) => `${HUB_PATH}/${conGiapSlug(chi)}`));
  });

  it('renders the intro paragraphs', async () => {
    renderHub(INTRO);

    expect(await screen.findByText(INTRO.intro[0])).toBeTruthy();
    expect(screen.getByText(INTRO.intro[1])).toBeTruthy();
  });

  it('still renders the tiles when the intro is empty', async () => {
    renderHub(EMPTY_INTRO);

    expect(await screen.findByRole('heading', { name: 'Tử vi 2027 theo tuổi' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /^Tuổi / })).toHaveLength(12);
  });

  it('links to Vận hạn and the birth form with the view year', async () => {
    renderHub(INTRO);

    const vanHan = await screen.findByRole('link', { name: 'Xem vận hạn theo con giáp' });
    const cta = new URL(
      screen.getByRole('link', { name: 'Lập lá số của bạn' }).getAttribute('href') ?? '',
      HREF_BASE,
    );

    expect(vanHan.getAttribute('href')).toBe('/van-han');
    expect(cta.pathname).toBe('/');
    expect(cta.searchParams.get('viewYear')).toBe('2027');
    expect(cta.hash).toBe('#lap-la-so');
  });

  it('opens with a Night hero holding the breadcrumb and the h1', async () => {
    renderHub(INTRO);

    const hero = heroOf(await screen.findByRole('heading', { level: 1 }));

    expect(hero.className).toContain('bg-night');
    expect(within(hero).getByRole('navigation', { name: 'Đường dẫn' })).toBeTruthy();
  });

  it('puts the con giáp tiles on the Night hero', async () => {
    renderHub(INTRO);

    const hero = heroOf(await screen.findByRole('heading', { level: 1 }));
    const tiles = screen.getAllByRole('link', { name: /^Tuổi / });

    expect(tiles).toHaveLength(12);
    for (const tile of tiles) {
      expect(hero.contains(tile)).toBe(true);
    }
  });

  it('gives every hub tile the two-tone focus ring', async () => {
    renderHub(INTRO);

    const tiles = await screen.findAllByRole('link', { name: /^Tuổi / });

    for (const tile of tiles) {
      expect(tile.className).toContain(FOCUS_RING_CLASS);
    }
  });

  it('fills every Night tile so the hero ornament never shows under its text', async () => {
    renderHub(INTRO);

    const tiles = await screen.findAllByRole('link', { name: /^Tuổi / });

    for (const tile of tiles) {
      expect(tile.className).toContain('bg-night');
    }
  });

  it('paints the hub hero with the Tết eve night', async () => {
    renderHub(INTRO);

    const hero = heroOf(await screen.findByRole('heading', { level: 1 }));

    expect(hero.querySelector('img')?.getAttribute('src')).toContain('/tet/hero-night-1536.webp');
  });

  it('shows each con giáp emblem on its tile as decoration', async () => {
    renderHub(INTRO);

    const tiles = await screen.findAllByRole('link', { name: /^Tuổi / });

    tiles.forEach((tile, chi) => {
      const emblem = tile.querySelector('img');
      expect(emblem?.getAttribute('alt')).toBe('');
      expect(emblem?.getAttribute('src')).toContain(`/tet/emblem/${conGiapSlug(chi)}-128.webp`);
    });
  });

  it('makes the form CTA a gold CTA button', async () => {
    renderHub(INTRO);

    const cta = await screen.findByRole('link', { name: 'Lập lá số của bạn' });

    expect(cta.className).toContain('bg-gold');
  });

  it('shares the hub with its own card image', async () => {
    renderHub(INTRO);

    await waitFor(() =>
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
        'https://xemtuvimienphi.top/tet/og/tu-vi-2027.jpg',
      ),
    );
  });

  it('titles the head and makes it canonical to the hub', async () => {
    renderHub(INTRO);

    await waitFor(() =>
      expect(document.title).toBe(
        'Tử vi 2027 theo tuổi: sao chiếu mệnh, hạn, Tam tai cho 12 con giáp | Tử Vi Miễn Phí',
      ),
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://xemtuvimienphi.top/kien-thuc/tu-vi-2027',
    );
  });
});
