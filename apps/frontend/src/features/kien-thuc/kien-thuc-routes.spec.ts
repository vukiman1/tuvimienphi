import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { KIEN_THUC_MANIFEST_FILE, isReservedLessonSlug } from '@org/shared-contracts';
import type { KienThucManifest } from '@org/shared-contracts';
import { routeTree } from '@/routeTree.gen';
import { TET_HUB_SLUG } from '../tet-hub/tet-hub-paths';
import { publishedLessons } from './published-pages';
import { EMPTY_MANIFEST } from './content-source';

const MANIFEST_PATH = join(__dirname, 'content', KIEN_THUC_MANIFEST_FILE);
const ROUTE_ID_PREFIX = '/_site/kien-thuc/';
const LESSON_SLUG_SEGMENT = '$slug';
const ENTRY_SEGMENTS = ['sao', 'cung', 'thuat-ngu'] as const;

function readManifest(): KienThucManifest {
  if (!existsSync(MANIFEST_PATH)) return EMPTY_MANIFEST;
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as KienThucManifest;
}

function createTestRouter(path: string) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

function leafRouteId(path: string): string | undefined {
  const matches = createTestRouter(path).matchRoutes(path, {});
  return matches[matches.length - 1]?.routeId;
}

function firstSegmentsUnderKienThuc(): readonly string[] {
  return Object.keys(createTestRouter('/').routesById)
    .filter((routeId) => routeId.startsWith(ROUTE_ID_PREFIX))
    .map((routeId) => routeId.slice(ROUTE_ID_PREFIX.length).split('/')[0])
    .filter((segment) => segment !== '' && segment !== LESSON_SLUG_SEGMENT);
}

describe('Kiến thức route precedence', () => {
  it.each(ENTRY_SEGMENTS)('sends the %s index path to its own route, not to a lesson', (kind) => {
    expect(leafRouteId(`/kien-thuc/${kind}`)).toBe(`${ROUTE_ID_PREFIX}${kind}/`);
  });

  it.each(ENTRY_SEGMENTS)("sends a %s entry path to that kind's entry route", (kind) => {
    expect(leafRouteId(`/kien-thuc/${kind}/thien-co`)).toBe(`${ROUTE_ID_PREFIX}${kind}/$slug`);
  });

  it('still sends a lesson slug to the lesson route', () => {
    expect(leafRouteId('/kien-thuc/tam-hop-xung-chieu')).toBe(`${ROUTE_ID_PREFIX}$slug`);
  });
});

describe('Kiến thức reserved segments', () => {
  it('reserves every static segment under kiến thức', () => {
    const unreserved = [...firstSegmentsUnderKienThuc(), TET_HUB_SLUG].filter(
      (segment) => !isReservedLessonSlug(segment),
    );

    expect(unreserved).toEqual([]);
  });

  it('never publishes a lesson under a reserved segment', () => {
    const reserved = publishedLessons(readManifest())
      .map((lesson) => lesson.slug)
      .filter(isReservedLessonSlug);

    expect(reserved).toEqual([]);
  });
});
