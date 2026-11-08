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
import fixture from '../__fixtures__/hub.json';
import { tetHubHead } from '../tet-hub-head';
import { TetHubPage } from './tet-hub-page';

const INTRO: TetHubIntro = fixture;
const EMPTY_INTRO: TetHubIntro = { intro: [] };
const HUB_PATH = '/kien-thuc/tu-vi-2027';
const HREF_BASE = 'https://x';

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
