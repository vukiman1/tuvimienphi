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
import { ZodiacPicker } from './zodiac-picker';

const PICKER_LABEL = 'Chọn con giáp';
const ZODIAC_COUNT = 12;
const EMBLEM_SIZE = '48';

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
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

async function pickerLinks(): Promise<readonly HTMLElement[]> {
  const picker = await screen.findByRole('navigation', { name: PICKER_LABEL });
  return within(picker).getAllByRole('link');
}

describe('ZodiacPicker', () => {
  it("shows each con giáp's gold emblem, decoratively", async () => {
    renderAt('/van-han', <ZodiacPicker />);

    const picker = await screen.findByRole('navigation', { name: PICKER_LABEL });
    const emblems = Array.from(picker.querySelectorAll('img'));
    expect(emblems).toHaveLength(ZODIAC_COUNT);
    for (const emblem of emblems) {
      expect(emblem.getAttribute('alt')).toBe('');
      expect(emblem.getAttribute('loading')).toBe('lazy');
      expect(emblem.getAttribute('width')).toBe(EMBLEM_SIZE);
      expect(emblem.getAttribute('height')).toBe(EMBLEM_SIZE);
    }
    expect(emblems[0].getAttribute('src')).toMatch(/\/tet\/emblem\/tuoi-ty-128\.webp$/);
    expect(emblems[ZODIAC_COUNT - 1].getAttribute('src')).toMatch(
      /\/tet\/emblem\/tuoi-hoi-128\.webp$/,
    );
  });

  it('marks the con giáp being read with a ring, not colour alone', async () => {
    renderAt('/van-han/tuoi-ty', <ZodiacPicker />);

    const links = await pickerLinks();
    const picked = links.filter((link) => link.hasAttribute('aria-current'));
    expect(picked).toHaveLength(1);
    expect(picked[0].textContent).toBe('Tý');
    expect(picked[0].getAttribute('aria-current')).toBe('page');
    expect(classTokens(picked[0])).toEqual(
      expect.arrayContaining(['inset-ring-2', 'inset-ring-ink']),
    );
    const ringed = links.filter((link) => classTokens(link).includes('inset-ring-2'));
    expect(ringed).toEqual(picked);
  });

  it('marks the con giáp being read on a year path too', async () => {
    renderAt('/van-han/2026/tuoi-ty', <ZodiacPicker year={2026} />);

    const picked = (await pickerLinks()).filter((link) => link.hasAttribute('aria-current'));
    expect(picked).toHaveLength(1);
    expect(picked[0].textContent).toBe('Tý');
    expect(picked[0].getAttribute('aria-current')).toBe('page');
    expect(classTokens(picked[0])).toEqual(
      expect.arrayContaining(['inset-ring-2', 'inset-ring-ink']),
    );
  });

  it('keeps the ring under keyboard focus', async () => {
    renderAt('/van-han/tuoi-ty', <ZodiacPicker />);

    const picked = (await pickerLinks()).find((link) => link.hasAttribute('aria-current'));
    expect(classTokens(picked ?? null)).not.toContain('ring-2');
  });

  it('gives every con giáp a 44 px target and the focus ring', async () => {
    renderAt('/van-han', <ZodiacPicker />);

    for (const link of await pickerLinks()) {
      expect(classTokens(link)).toEqual(
        expect.arrayContaining(['min-h-11', ...FOCUS_RING_CLASS.split(' ')]),
      );
    }
  });

  it('draws no zodiac PNG and no CSS filter', async () => {
    renderAt('/van-han/tuoi-ty', <ZodiacPicker />);

    const picker = await screen.findByRole('navigation', { name: PICKER_LABEL });
    for (const image of Array.from(picker.querySelectorAll('img'))) {
      expect(image.getAttribute('src')).not.toContain('/zodiac/');
    }
    expect(picker.querySelectorAll('[style]')).toHaveLength(0);
  });
});
