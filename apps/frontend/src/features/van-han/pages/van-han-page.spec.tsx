import type { ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { VanHanPage } from './van-han-page';

const HREF_BASE = 'https://x';
const ZODIAC_COUNT = 12;

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function pathOf(link: HTMLElement): string {
  return new URL(link.getAttribute('href') ?? '', HREF_BASE).pathname;
}

function renderAt(path: string, ui: ReactElement): void {
  const rootRoute = createRootRoute({ component: Outlet });
  const routes = ['/van-han', '/van-han/$slug', '/van-han/$year/$slug'].map((routePath) =>
    createRoute({ getParentRoute: () => rootRoute, path: routePath, component: () => ui }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
}

async function heroSection(): Promise<HTMLElement> {
  const title = await screen.findByRole('heading', { level: 1 });
  const section = title.closest('section');
  expect(section).not.toBeNull();
  return section ?? document.body;
}

describe('VanHanPage', () => {
  it('opens with a Night hero holding the only h1', async () => {
    renderAt('/van-han', <VanHanPage />);

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
    renderAt('/van-han', <VanHanPage />);

    const accent = (await screen.findByRole('heading', { level: 1 })).querySelector('.italic');
    expect(accent?.textContent).toBe('Hạn');
    expect(classTokens(accent)).toContain('text-dawn');
  });

  it('links the Tết hub from the hero', async () => {
    renderAt('/van-han', <VanHanPage />);

    const hubLink = within(await heroSection()).getByRole('link', {
      name: 'Tử vi 2027 theo tuổi',
    });
    expect(pathOf(hubLink)).toBe('/kien-thuc/tu-vi-2027');
    expect(classTokens(hubLink)).toEqual(
      expect.arrayContaining(['min-h-11', ...FOCUS_RING_CLASS.split(' ')]),
    );
  });

  it('lists the 12 con giáp on a Day zone below the hero', async () => {
    renderAt('/van-han', <VanHanPage />);

    const hero = await heroSection();
    const picker = screen.getByRole('navigation', { name: 'Chọn con giáp' });
    expect(within(picker).getAllByRole('link')).toHaveLength(ZODIAC_COUNT);
    expect(classTokens(picker.closest('section'))).toContain('bg-day');
    expect(hero.contains(picker)).toBe(false);
  });
});
