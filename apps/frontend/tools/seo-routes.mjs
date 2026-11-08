import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
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
const TET_HUB_ENGINE = '@org/shared-tu-vi';
const PAGE_FILE_EXTENSION = '.json';
const PROBLEM_SEPARATOR = '; ';
const SLUG_SEPARATOR = ', ';
const requireFromHere = createRequire(import.meta.url);

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

function expectedTetHubSlugs() {
  const { CHI, conGiapSlug, tuoiNamBirthYears, tuoiNamSlug } = requireFromHere(TET_HUB_ENGINE);
  return {
    conGiap: CHI.map((_, chi) => conGiapSlug(chi)),
    tuoiNam: tuoiNamBirthYears().map(tuoiNamSlug),
  };
}

function listProblems(kind, listed, expected) {
  const missing = expected.filter((slug) => !listed.includes(slug));
  const unknown = listed.filter((slug) => !expected.includes(slug));
  return [
    ...(missing.length > 0 ? [`${kind} is missing ${missing.join(SLUG_SEPARATOR)}`] : []),
    ...(unknown.length > 0 ? [`${kind} lists unknown slugs ${unknown.join(SLUG_SEPARATOR)}`] : []),
  ];
}

function missingFileProblems(manifestPath, slugs) {
  const directory = dirname(manifestPath);
  const missing = slugs.filter(
    (slug) => !existsSync(join(directory, `${slug}${PAGE_FILE_EXTENSION}`)),
  );
  return missing.length > 0 ? [`no page file for ${missing.join(SLUG_SEPARATOR)}`] : [];
}

function assertCompleteManifest(manifestPath, manifest) {
  const expected = expectedTetHubSlugs();
  const problems = [
    ...listProblems('conGiap', manifest.conGiap, expected.conGiap),
    ...listProblems('tuoiNam', manifest.tuoiNam, expected.tuoiNam),
    ...missingFileProblems(manifestPath, [...manifest.conGiap, ...manifest.tuoiNam]),
  ];
  if (problems.length > 0) {
    throw new TetHubManifestError(manifestPath, problems.join(PROBLEM_SEPARATOR));
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
  assertCompleteManifest(manifestPath, manifest);
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
