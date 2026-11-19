import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGACY_REDIRECTS } from './legacy-redirects.mjs';

/**
 * Single source of truth for the public, indexable routes — consumed by the prerender step
 * (prerender.mjs), which also writes the sitemap from them. Personalised/auth routes (la-so/detail,
 * dashboard, login, register) are intentionally excluded: they are noindex and have nothing to crawl.
 */
const VAN_HAN_PATH = '/van-han';
const KIEN_THUC_PATH = '/kien-thuc';
const STATIC_PATHS = ['/', KIEN_THUC_PATH, '/ngay-tot', VAN_HAN_PATH, '/la-so'];
const TU_VI_ENGINE = '@org/shared-tu-vi';
const SHARED_CONTRACTS = '@org/shared-contracts';
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

export class TetHubPageError extends Error {
  constructor(pagePath, reason) {
    super(`Tet hub page ${pagePath} is malformed: ${reason}`);
    this.name = 'TetHubPageError';
  }
}

export class KienThucManifestError extends Error {
  constructor(manifestPath, reason) {
    super(`Kien thuc manifest ${manifestPath} is malformed: ${reason}`);
    this.name = 'KienThucManifestError';
  }
}

export class KienThucContentFileError extends Error {
  constructor(filePath, reason) {
    super(`Kien thuc content file ${filePath} is malformed: ${reason}`);
    this.name = 'KienThucContentFileError';
  }
}

export class LegacyRedirectError extends Error {
  constructor(unpublishedRedirects) {
    const redirects = unpublishedRedirects.map(({ from, to }) => `${from} -> ${to}`);
    super(`Legacy redirects point at unpublished pages: ${redirects.join(SLUG_SEPARATOR)}`);
    this.name = 'LegacyRedirectError';
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

function tetHubViewYear() {
  return requireFromHere(TU_VI_ENGINE).TET_HUB_VIEW_YEAR;
}

function tetHubPath() {
  return `/kien-thuc/tu-vi-${tetHubViewYear()}`;
}

function defaultManifestPath() {
  return fileURLToPath(
    new URL(`../src/features/tet-hub/content/${tetHubViewYear()}/manifest.json`, import.meta.url),
  );
}

function vanHanZodiacPaths(prefix) {
  const { CHI, conGiapSlug } = requireFromHere(TU_VI_ENGINE);
  return CHI.map((_, chi) => `${prefix}/${conGiapSlug(chi)}`);
}

function vanHanYearZodiacPaths(vanHanYears) {
  return vanHanYears.flatMap((year) => vanHanZodiacPaths(`${VAN_HAN_PATH}/${year}`));
}

function expectedTetHubSlugs() {
  const { CHI, conGiapSlug, tuoiNamBirthYears, tuoiNamSlug } = requireFromHere(TU_VI_ENGINE);
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

function pageSlugsOnDisk(manifestPath, slugs) {
  const directory = dirname(manifestPath);
  return slugs.filter((slug) => existsSync(join(directory, `${slug}${PAGE_FILE_EXTENSION}`)));
}

function missingFileProblems(manifestPath, slugs) {
  const onDisk = pageSlugsOnDisk(manifestPath, slugs);
  const missing = slugs.filter((slug) => !onDisk.includes(slug));
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

function assertNoPagesWithoutManifest(manifestPath) {
  const expected = expectedTetHubSlugs();
  const orphans = pageSlugsOnDisk(manifestPath, [...expected.conGiap, ...expected.tuoiNam]);
  if (orphans.length > 0) {
    throw new TetHubManifestError(
      manifestPath,
      `pages without a manifest (${orphans.join(SLUG_SEPARATOR)})`,
    );
  }
}

function getTetHubSlugs(manifestPath) {
  if (!existsSync(manifestPath)) {
    assertNoPagesWithoutManifest(manifestPath);
    return [];
  }
  const manifest = parseManifest(manifestPath);
  if (!isStringList(manifest?.conGiap) || !isStringList(manifest?.tuoiNam)) {
    throw new TetHubManifestError(manifestPath, 'conGiap and tuoiNam must be lists of slugs');
  }
  assertCompleteManifest(manifestPath, manifest);
  return [...manifest.conGiap, ...manifest.tuoiNam];
}

function tetHubPageGeneratedAt(manifestPath, slug) {
  const pagePath = join(dirname(manifestPath), `${slug}${PAGE_FILE_EXTENSION}`);
  let page;
  try {
    page = JSON.parse(readFileSync(pagePath, 'utf8'));
  } catch (error) {
    throw new TetHubPageError(pagePath, error.message);
  }
  if (typeof page?.generatedAt !== 'string') {
    throw new TetHubPageError(pagePath, 'generatedAt must be a string');
  }
  return page.generatedAt;
}

function sharedContracts() {
  return requireFromHere(SHARED_CONTRACTS);
}

function defaultKienThucDirectory() {
  return fileURLToPath(new URL('../src/features/kien-thuc/content', import.meta.url));
}

function entryKinds() {
  return Object.keys(sharedContracts().ENTRY_GROUPS_BY_KIND);
}

function isDatedPage(page) {
  return typeof page?.slug === 'string' && typeof page?.reviewedAt === 'string';
}

function isManifestStep(step) {
  return Array.isArray(step?.lessons) && step.lessons.every(isDatedPage);
}

function isManifestEntry(entry) {
  return isDatedPage(entry) && entryKinds().includes(entry.kind);
}

function parseKienThucManifest(manifestPath) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    throw new KienThucManifestError(manifestPath, error.message);
  }
  const isWellFormed =
    Array.isArray(manifest?.steps) &&
    Array.isArray(manifest?.entries) &&
    manifest.steps.every(isManifestStep) &&
    manifest.entries.every(isManifestEntry);
  if (!isWellFormed) {
    throw new KienThucManifestError(
      manifestPath,
      'steps and entries must list pages with a slug and a reviewedAt',
    );
  }
  return manifest;
}

function contentFilesOfKind(kienThucDirectory, kind) {
  const { contentFilePath, isContentSlug } = sharedContracts();
  const kindDirectory = join(kienThucDirectory, kind);
  if (!existsSync(kindDirectory)) {
    return [];
  }
  return readdirSync(kindDirectory)
    .filter((name) => name.endsWith(PAGE_FILE_EXTENSION))
    .map((name) => {
      const slug = name.slice(0, -PAGE_FILE_EXTENSION.length);
      if (!isContentSlug(slug)) {
        throw new KienThucContentFileError(join(kindDirectory, name), 'its name is not a slug');
      }
      return contentFilePath(kind, slug);
    });
}

function contentFilesOnDisk(kienThucDirectory) {
  const { ContentKind } = sharedContracts();
  return Object.values(ContentKind).flatMap((kind) => contentFilesOfKind(kienThucDirectory, kind));
}

function publishedKienThucPages(manifest) {
  const { ContentKind, contentFilePath } = sharedContracts();
  const lessons = manifest.steps.flatMap((step) =>
    step.lessons.map(({ slug, reviewedAt }) => ({
      file: contentFilePath(ContentKind.Bai, slug),
      path: `${KIEN_THUC_PATH}/${slug}`,
      reviewedAt,
    })),
  );
  const entries = manifest.entries.map(({ kind, slug, reviewedAt }) => ({
    file: contentFilePath(kind, slug),
    path: `${KIEN_THUC_PATH}/${kind}/${slug}`,
    reviewedAt,
  }));
  return [...lessons, ...entries];
}

function indexPages(manifest) {
  return entryKinds()
    .filter((kind) => manifest.entries.some((entry) => entry.kind === kind))
    .map((kind) => ({ path: `${KIEN_THUC_PATH}/${kind}` }));
}

function reservedLessonProblems(manifest) {
  const { isReservedLessonSlug } = sharedContracts();
  const reserved = manifest.steps
    .flatMap((step) => step.lessons.map((lesson) => lesson.slug))
    .filter(isReservedLessonSlug);
  return reserved.length > 0 ? [`reserved lesson slugs ${reserved.join(SLUG_SEPARATOR)}`] : [];
}

function fileDriftProblems(listedFiles, filesOnDisk) {
  const missing = listedFiles.filter((file) => !filesOnDisk.includes(file));
  const unlisted = filesOnDisk.filter((file) => !listedFiles.includes(file));
  return [
    ...(missing.length > 0 ? [`no content file for ${missing.join(SLUG_SEPARATOR)}`] : []),
    ...(unlisted.length > 0 ? [`does not list ${unlisted.join(SLUG_SEPARATOR)}`] : []),
  ];
}

function readKienThucPages(kienThucDirectory) {
  const { KIEN_THUC_MANIFEST_FILE } = sharedContracts();
  const manifestPath = join(kienThucDirectory, KIEN_THUC_MANIFEST_FILE);
  const filesOnDisk = contentFilesOnDisk(kienThucDirectory);
  if (!existsSync(manifestPath)) {
    if (filesOnDisk.length > 0) {
      throw new KienThucManifestError(
        manifestPath,
        `content files without a manifest (${filesOnDisk.join(SLUG_SEPARATOR)})`,
      );
    }
    return [];
  }
  const manifest = parseKienThucManifest(manifestPath);
  const pages = publishedKienThucPages(manifest);
  const problems = [
    ...reservedLessonProblems(manifest),
    ...fileDriftProblems(
      pages.map((page) => page.file),
      filesOnDisk,
    ),
  ];
  if (problems.length > 0) {
    throw new KienThucManifestError(manifestPath, problems.join(PROBLEM_SEPARATOR));
  }
  return [...indexPages(manifest), ...pages.map(({ path, reviewedAt }) => ({ path, reviewedAt }))];
}

function assertRedirectsPublished(pages, legacyRedirects) {
  const publishedPaths = pages.map((page) => page.path);
  const unpublished = legacyRedirects.filter(({ to }) => !publishedPaths.includes(to));
  if (unpublished.length > 0) {
    throw new LegacyRedirectError(unpublished);
  }
}

export function getKienThucPages(kienThucDirectory, legacyRedirects = LEGACY_REDIRECTS) {
  const pages = readKienThucPages(kienThucDirectory);
  assertRedirectsPublished(pages, legacyRedirects);
  return pages;
}

/** All public routes, e.g. `['/', '/kien-thuc', …, '/kien-thuc/tu-vi-la-gi', …]`. */
export function getSeoRoutes({
  manifestPath = defaultManifestPath(),
  vanHanYears,
  kienThucDirectory = defaultKienThucDirectory(),
  legacyRedirects = LEGACY_REDIRECTS,
}) {
  const hubPath = tetHubPath();
  return [
    ...STATIC_PATHS,
    ...vanHanZodiacPaths(VAN_HAN_PATH),
    ...vanHanYearZodiacPaths(vanHanYears),
    hubPath,
    ...getKienThucPages(kienThucDirectory, legacyRedirects).map((page) => page.path),
    ...getTetHubSlugs(manifestPath).map((slug) => `${hubPath}/${slug}`),
  ];
}

function isCanonicalElsewhere(path, vanHanYears) {
  return vanHanYears.length > 0 && vanHanZodiacPaths(VAN_HAN_PATH).includes(path);
}

export function getSitemapEntries({
  manifestPath = defaultManifestPath(),
  vanHanYears,
  kienThucDirectory = defaultKienThucDirectory(),
  legacyRedirects = LEGACY_REDIRECTS,
}) {
  const hubPath = tetHubPath();
  const lastModifiedByPath = new Map([
    ...getTetHubSlugs(manifestPath).map((slug) => [
      `${hubPath}/${slug}`,
      tetHubPageGeneratedAt(manifestPath, slug),
    ]),
    ...getKienThucPages(kienThucDirectory, legacyRedirects)
      .filter((page) => page.reviewedAt !== undefined)
      .map((page) => [page.path, page.reviewedAt]),
  ]);
  return getSeoRoutes({ manifestPath, vanHanYears, kienThucDirectory, legacyRedirects })
    .filter((path) => !isCanonicalElsewhere(path, vanHanYears))
    .map((path) =>
      lastModifiedByPath.has(path)
        ? { path, lastModified: lastModifiedByPath.get(path) }
        : { path },
    );
}
