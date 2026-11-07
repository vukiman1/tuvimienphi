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
import type { TuoiNamArticle } from '@org/shared-contracts';
import fixture from '../__fixtures__/tuoi-binh-dan-1986.json';
import { loadTetHubSlugPage, tetHubSlugHead } from '../tet-hub-slug-route';
import { TetHubSlugPage } from './tet-hub-slug-page';

const ARTICLE: TuoiNamArticle = fixture;
const SLUG_ROUTE_PATH = '/kien-thuc/tu-vi-2027/$slug';
const HREF_BASE = 'https://x';

function loadFixture(slug: string): Promise<TuoiNamArticle | undefined> {
  return Promise.resolve(slug === ARTICLE.slug ? ARTICLE : undefined);
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
    loader: ({ params }) => loadTetHubSlugPage(params.slug, loadFixture),
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

  render(<RouterProvider router={router as never} />);
}

function robotsContent(): string | null | undefined {
  return document.querySelector('meta[name="robots"]')?.getAttribute('content');
}

function linkUrl(link: HTMLElement): URL {
  return new URL(link.getAttribute('href') ?? '', HREF_BASE);
}

describe('TetHubSlugPage for a birth year', () => {
  it('answers the query before the article', async () => {
    renderSlug(ARTICLE.slug);

    const summary = await screen.findByRole('complementary', { name: /Bính Dần 1986/ });
    const article = screen.getByRole('article');
    const firstArticleHeading = within(article).getAllByRole('heading')[0];

    expect(within(summary).getByText('42')).toBeTruthy();
    expect(within(summary).getByText('Lô Trung Hỏa')).toBeTruthy();
    expect(
      within(within(summary).getByRole('group', { name: 'Nam mạng' })).getByText('Vân Hớn'),
    ).toBeTruthy();
    expect(
      within(within(summary).getByRole('group', { name: 'Nữ mạng' })).getByText('La Hầu'),
    ).toBeTruthy();
    expect(
      summary.compareDocumentPosition(firstArticleHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('links the CTA to the form with the view year and no birth year', async () => {
    renderSlug(ARTICLE.slug);

    const url = linkUrl(await screen.findByRole('link', { name: 'Lập lá số của bạn' }));

    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('viewYear')).toBe('2027');
    expect(url.searchParams.has('year')).toBe(false);
    expect(url.hash).toBe('#lap-la-so');
  });

  it('sets the gender in the CTA inside each gender subsection', async () => {
    renderSlug(ARTICLE.slug);

    const namSection = await screen.findByRole('region', { name: 'Nam mạng' });
    const nuSection = screen.getByRole('region', { name: 'Nữ mạng' });
    const namUrl = linkUrl(within(namSection).getByRole('link', { name: /Lập lá số/ }));
    const nuUrl = linkUrl(within(nuSection).getByRole('link', { name: /Lập lá số/ }));

    expect(namSection.id).toBe('nam-mang');
    expect(nuSection.id).toBe('nu-mang');
    expect(namUrl.searchParams.get('gender')).toBe('nam');
    expect(nuUrl.searchParams.get('gender')).toBe('nu');
    expect(namUrl.searchParams.get('viewYear')).toBe('2027');
    expect(namUrl.hash).toBe('#lap-la-so');
  });

  it('states the Tam tai, Thái tuế and xông đất verdicts from the facts', async () => {
    renderSlug(ARTICLE.slug);

    expect(await screen.findByText('Tuổi Dần không phạm Tam tai trong năm 2027.')).toBeTruthy();
    expect(screen.getByText('Tuổi Dần không phạm Thái tuế năm Đinh Mùi 2027.')).toBeTruthy();
  });
});

describe('TetHubSlugPage not found', () => {
  it('shows the not-found state for an unknown slug', async () => {
    renderSlug('tuoi-binh-dan-1987');

    expect(await screen.findByRole('heading', { name: 'Không tìm thấy trang' })).toBeTruthy();
    await waitFor(() => expect(robotsContent()).toContain('noindex'));
  });

  it('shows the not-found state for a birth year whose article is not generated yet', async () => {
    renderSlug('tuoi-dinh-mao-1987');

    expect(await screen.findByRole('heading', { name: 'Không tìm thấy trang' })).toBeTruthy();
    await waitFor(() => expect(robotsContent()).toContain('noindex'));
  });
});
