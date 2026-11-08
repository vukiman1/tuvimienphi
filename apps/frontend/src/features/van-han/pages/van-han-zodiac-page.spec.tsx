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

function renderZodiacPage(path: string, current: VanHanCurrent | null): void {
  const rootRoute = createRootRoute({ component: RootLayout });
  const zodiacRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/van-han/$slug',
    loader: () => current,
    head: ({ loaderData }) => vanHanZodiacHead('Tý', loaderData ?? null),
    component: ZodiacRoute,
  });
  function ZodiacRoute(): ReactElement {
    return <VanHanZodiacPage chi="Tý" current={zodiacRoute.useLoaderData()} />;
  }
  const router = createRouter({
    routeTree: rootRoute.addChildren([zodiacRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
}

function pathOf(link: HTMLElement): string {
  return new URL(link.getAttribute('href') ?? '', HREF_BASE).pathname;
}

describe('VanHanZodiacPage', () => {
  it('heads the page with the published reading and its overview', async () => {
    renderZodiacPage('/van-han/tuoi-ty', VAN_HAN_CURRENT);

    expect(await screen.findByRole('heading', { level: 1, name: TY_ENTRY.title })).toBeTruthy();
    expect(screen.getByText(/Năm nay, tuổi Tý nên chú trọng sức khỏe/)).toBeTruthy();
    await waitFor(() => expect(document.title).toBe(`${TY_ENTRY.title} | Tử Vi Miễn Phí`));
  });

  it('links every con giáp to its own page and marks the one being read', async () => {
    renderZodiacPage('/van-han/tuoi-ty', VAN_HAN_CURRENT);

    const picker = await screen.findByRole('navigation', { name: 'Chọn con giáp' });
    const links = within(picker).getAllByRole('link');
    expect(links).toHaveLength(ZODIAC_COUNT);
    expect(links.map(pathOf)).toContain('/van-han/tuoi-hoi');
    expect(pathOf(within(picker).getByRole('link', { current: 'page' }))).toBe('/van-han/tuoi-ty');
  });

  it('points to the same con giáp in the Tết 2027 hub', async () => {
    renderZodiacPage('/van-han/tuoi-ty', VAN_HAN_CURRENT);

    const hubLink = await screen.findByRole('link', { name: /Tử vi 2027 tuổi Tý/ });
    expect(pathOf(hubLink)).toBe('/kien-thuc/tu-vi-2027/tuoi-ty');
  });

  it('says the reading is not out yet when no year is published', async () => {
    renderZodiacPage('/van-han/tuoi-ty', null);

    expect(await screen.findByRole('heading', { level: 1, name: 'Vận hạn tuổi Tý' })).toBeTruthy();
    expect(screen.getByText(/chưa được cập nhật/)).toBeTruthy();
  });
});
