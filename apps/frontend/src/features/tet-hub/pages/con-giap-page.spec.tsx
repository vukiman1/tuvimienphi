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
import type { ConGiapArticle } from '@org/shared-contracts';
import fixture from '../__fixtures__/tuoi-dan.json';
import { loadTetHubSlugPage, tetHubSlugHead } from '../tet-hub-slug-route';
import { TetHubSlugPage } from './tet-hub-slug-page';

const ARTICLE: ConGiapArticle = fixture;
const SLUG_ROUTE_PATH = '/kien-thuc/tu-vi-2027/$slug';
const DAN_BIRTH_YEAR_SLUGS: readonly string[] = [
  'tuoi-canh-dan-1950',
  'tuoi-nham-dan-1962',
  'tuoi-giap-dan-1974',
  'tuoi-binh-dan-1986',
  'tuoi-mau-dan-1998',
  'tuoi-canh-dan-2010',
];
const HREF_BASE = 'https://x';

function loadFixture(slug: string): Promise<ConGiapArticle | undefined> {
  return Promise.resolve(slug === ARTICLE.slug ? ARTICLE : undefined);
}

function loadNone(): Promise<undefined> {
  return Promise.resolve(undefined);
}

function RootLayout(): ReactElement {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}

function renderSlug(slug: string): void {
  const rootRoute = createRootRoute({ component: RootLayout });
  const slugRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: SLUG_ROUTE_PATH,
    loader: ({ params }) =>
      loadTetHubSlugPage(params.slug, { tuoiNam: loadNone, conGiap: loadFixture }),
    head: ({ params, loaderData }) => tetHubSlugHead(params.slug, loaderData),
    component: SlugRoute,
  });
  function SlugRoute(): ReactElement {
    return <TetHubSlugPage data={slugRoute.useLoaderData()} />;
  }
  const router = createRouter({
    routeTree: rootRoute.addChildren([slugRoute]),
    history: createMemoryHistory({ initialEntries: [`/kien-thuc/tu-vi-2027/${slug}`] }),
  });

  render(<RouterProvider router={router} />);
}

function robotsContent(): string | null | undefined {
  return document.querySelector('meta[name="robots"]')?.getAttribute('content');
}

function canonicalHref(): string | null | undefined {
  return document.querySelector('link[rel="canonical"]')?.getAttribute('href');
}

describe('TetHubSlugPage for a con giáp', () => {
  it('lists every Dần year in range', async () => {
    renderSlug(ARTICLE.slug);

    const list = within(await screen.findByRole('region', { name: 'Các năm sinh tuổi Dần' }));
    const hrefs = list.getAllByRole('link').map((link) => {
      return new URL(link.getAttribute('href') ?? '', HREF_BASE).pathname;
    });

    expect(hrefs).toEqual(DAN_BIRTH_YEAR_SLUGS.map((slug) => `/kien-thuc/tu-vi-2027/${slug}`));
  });

  it('shows the Nam and Nữ sao chips from the engine on each year tile', async () => {
    renderSlug(ARTICLE.slug);

    const tile = await screen.findByRole('link', { name: /Bính Dần 1986/ });

    expect(within(tile).getByText('Nam: sao Vân Hớn')).toBeTruthy();
    expect(within(tile).getByText('Nữ: sao La Hầu')).toBeTruthy();
  });

  it('renders the four article sections and the form CTA', async () => {
    renderSlug(ARTICLE.slug);

    const article = within(await screen.findByRole('article'));

    expect(article.getByRole('heading', { name: 'Tam tai' })).toBeTruthy();
    expect(article.getByRole('heading', { name: 'Thái tuế' })).toBeTruthy();
    expect(article.getByText(ARTICLE.xongDat[0])).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lập lá số của bạn' })).toBeTruthy();
  });

  it('the con giáp head is canonical to its own path', async () => {
    renderSlug(ARTICLE.slug);

    await waitFor(() =>
      expect(document.title).toBe(
        'Tử vi tuổi Dần năm 2027: Tam tai, Thái tuế, tuổi xông đất | Tử Vi Miễn Phí',
      ),
    );
    expect(canonicalHref()).toBe('https://xemtuvimienphi.top/kien-thuc/tu-vi-2027/tuoi-dan');
    expect(robotsContent()).toBe('index, follow');
  });

  it('shows the not-found state for a con giáp whose article is not generated yet', async () => {
    renderSlug('tuoi-ty');

    expect(await screen.findByRole('heading', { name: 'Không tìm thấy trang' })).toBeTruthy();
    await waitFor(() => expect(robotsContent()).toContain('noindex'));
  });
});
