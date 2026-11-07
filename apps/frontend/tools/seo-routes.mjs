import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Single source of truth for the public, indexable routes — consumed by both the sitemap generator
 * (vite.config.mts) and the prerender step (prerender.mjs). Personalised/auth routes (la-so/detail,
 * dashboard, login, register) are intentionally excluded: they are noindex and have nothing to crawl.
 */
const TET_HUB_PATH = '/kien-thuc/tu-vi-2027';
const STATIC_PATHS = ['/', '/kien-thuc', '/ngay-tot', '/van-han', '/la-so', TET_HUB_PATH];
const TET_HUB_MANIFEST_PATH = fileURLToPath(
  new URL('../src/features/tet-hub/content/2027/manifest.json', import.meta.url),
);

export class TetHubManifestError extends Error {
  constructor(manifestPath, reason) {
    super(`Tet hub manifest ${manifestPath} is malformed: ${reason}`);
    this.name = 'TetHubManifestError';
  }
}

function isStringList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseManifest(manifestPath) {
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    throw new TetHubManifestError(manifestPath, error.message);
  }
}

function getTetHubSlugs(manifestPath) {
  if (!existsSync(manifestPath)) {
    return [];
  }
  const manifest = parseManifest(manifestPath);
  if (!isStringList(manifest?.conGiap) || !isStringList(manifest?.tuoiNam)) {
    throw new TetHubManifestError(manifestPath, 'conGiap and tuoiNam must be lists of slugs');
  }
  return [...manifest.conGiap, ...manifest.tuoiNam];
}

/** Read article slugs straight from the data file (regex, not import — see the note in vite.config.mts). */
export function getArticleSlugs() {
  const dataFile = fileURLToPath(
    new URL('../src/features/kien-thuc/kien-thuc-data.ts', import.meta.url),
  );
  const source = readFileSync(dataFile, 'utf8');
  return [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
}

/** All public routes, e.g. `['/', '/kien-thuc', …, '/kien-thuc/tu-vi-la-gi', …]`. */
export function getSeoRoutes({ manifestPath = TET_HUB_MANIFEST_PATH } = {}) {
  return [
    ...STATIC_PATHS,
    ...getArticleSlugs().map((slug) => `/kien-thuc/${slug}`),
    ...getTetHubSlugs(manifestPath).map((slug) => `${TET_HUB_PATH}/${slug}`),
  ];
}
