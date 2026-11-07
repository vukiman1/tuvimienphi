import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

const HUB_PATH = '/kien-thuc/tu-vi-2027';
const HUB_ROUTE_ID = '/_site/kien-thuc/tu-vi-2027/';
const OLD_ARTICLE_PATH = '/kien-thuc/tu-vi-la-gi';
const OLD_ARTICLE_ROUTE_ID = '/_site/kien-thuc/$slug';

function leafRouteId(path: string): string | undefined {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const matches = router.matchRoutes(path, {});
  return matches[matches.length - 1]?.routeId;
}

describe('Kiến thức route precedence', () => {
  it('resolves the hub path to the hub route, not the article route', () => {
    expect(leafRouteId(HUB_PATH)).toBe(HUB_ROUTE_ID);
  });

  it('still resolves other Kiến thức slugs to the article route', () => {
    expect(leafRouteId(OLD_ARTICLE_PATH)).toBe(OLD_ARTICLE_ROUTE_ID);
  });
});
