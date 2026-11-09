import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

function leafRouteId(path: string): string | undefined {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const matches = router.matchRoutes(path, {});
  return matches[matches.length - 1]?.routeId;
}

describe('Vận hạn routes', () => {
  it('keeps /van-han as the page listing the 12 con giáp', () => {
    expect(leafRouteId('/van-han')).toBe('/_site/van-han/');
  });

  it('gives a con giáp page its own route', () => {
    expect(leafRouteId('/van-han/tuoi-ty')).toBe('/_site/van-han/$slug');
  });

  it('gives a con giáp page of a given year its own route', () => {
    expect(leafRouteId('/van-han/2026/tuoi-ty')).toBe('/_site/van-han/$year/$slug');
  });
});
