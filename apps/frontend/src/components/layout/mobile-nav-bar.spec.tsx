import { render, screen, within } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { MobileNavBar } from './mobile-nav-bar';

async function renderAt(path: string): Promise<HTMLElement> {
  const rootRoute = createRootRoute({ component: MobileNavBar });
  const pageRoute = createRoute({ getParentRoute: () => rootRoute, path: '$' });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return screen.findByRole('navigation', { name: 'Mobile navigation' });
}

describe('MobileNavBar', () => {
  it('links the four tools and the birth form', async () => {
    const nav = await renderAt('/kien-thuc');

    expect(within(nav).getByRole('link', { name: 'Trang chủ' }).getAttribute('href')).toBe('/');
    expect(within(nav).getByRole('link', { name: 'Vận hạn' }).getAttribute('href')).toBe(
      '/van-han',
    );
    expect(within(nav).getByRole('link', { name: 'Ngày tốt' }).getAttribute('href')).toBe(
      '/ngay-tot',
    );
    expect(within(nav).getByRole('link', { name: 'Lá số của tôi' }).getAttribute('href')).toBe(
      '/la-so',
    );
    expect(within(nav).getByRole('link', { name: 'Lập lá số' }).getAttribute('href')).toBe(
      '/#lap-la-so',
    );
  });

  it('has no notification link', async () => {
    const nav = await renderAt('/');

    expect(nav.querySelector('a[href="/thong-bao"]')).toBeNull();
    expect(within(nav).queryByText('Thông báo')).toBeNull();
  });

  it('marks the tab of a nested route as current', async () => {
    const nav = await renderAt('/van-han/2027/tuoi-dan');

    expect(within(nav).getByRole('link', { name: 'Vận hạn' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(
      within(nav).getByRole('link', { name: 'Trang chủ' }).getAttribute('aria-current'),
    ).toBeNull();
    expect(
      within(nav).getByRole('link', { name: 'Lập lá số' }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('marks Lá số của tôi as current on a saved chart', async () => {
    const nav = await renderAt('/la-so/detail');

    expect(
      within(nav).getByRole('link', { name: 'Lá số của tôi' }).getAttribute('aria-current'),
    ).toBe('page');
  });

  it('shows the board icon, not the logo, in the centre action', async () => {
    const nav = await renderAt('/');
    const centre = within(nav).getByRole('link', { name: 'Lập lá số' });

    expect(centre.querySelector('img')).toBeNull();
    expect(centre.querySelector('svg')).not.toBeNull();
  });
});
