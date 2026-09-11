import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Single source of truth for the public, indexable routes — consumed by both the sitemap generator
 * (vite.config.mts) and the prerender step (prerender.mjs). Personalised/auth routes (la-so/detail,
 * dashboard, login, register) are intentionally excluded: they are noindex and have nothing to crawl.
 */
const STATIC_PATHS = ['/', '/kien-thuc', '/ngay-tot', '/van-han', '/la-so'];

/** Read article slugs straight from the data file (regex, not import — see the note in vite.config.mts). */
export function getArticleSlugs() {
  const dataFile = fileURLToPath(
    new URL('../src/features/kien-thuc/kien-thuc-data.ts', import.meta.url),
  );
  const source = readFileSync(dataFile, 'utf8');
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
}

/** All public routes, e.g. `['/', '/kien-thuc', …, '/kien-thuc/tu-vi-la-gi', …]`. */
export function getSeoRoutes() {
  return [...STATIC_PATHS, ...getArticleSlugs().map((slug) => `/kien-thuc/${slug}`)];
}
