import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ContentKind, EntryGroup, KIEN_THUC_MANIFEST_FILE } from '@org/shared-contracts';
import type { KienThucManifest, ManifestEntry, ManifestLesson } from '@org/shared-contracts';
import { CHI, conGiapSlug, tuoiNamBirthYears, tuoiNamSlug } from '@org/shared-tu-vi';
import { TET_HUB_PATH, tetHubPagePath } from '../src/features/tet-hub/tet-hub-paths';

const MANIFEST_FILE_NAME = 'manifest.json';
const CON_GIAP_SLUGS: readonly string[] = CHI.map((_, chi) => conGiapSlug(chi));
const TUOI_NAM_SLUGS: readonly string[] = tuoiNamBirthYears().map(tuoiNamSlug);
const MISSING_CON_GIAP_SLUG = 'tuoi-ti';
const MISSING_TUOI_NAM_SLUG = 'tuoi-binh-dan-1986';
const UNKNOWN_SLUG = 'tuoi-binh-dan-1926';
const GENERATED_AT = '2026-11-08T08:45:17.999Z';
const PUBLISHED_VAN_HAN_YEARS: readonly number[] = [2027, 2026];
const VAN_HAN_ZODIAC_PATHS: readonly string[] = CON_GIAP_SLUGS.map((slug) => `/van-han/${slug}`);
const KIEN_THUC_PATH = '/kien-thuc';
const KIEN_THUC_FIXTURES_DIRECTORY = join(__dirname, '../src/features/kien-thuc/__fixtures__');
const KIEN_THUC_CONTENT_DIRECTORY = 'content';
const UNGENERATED_KIEN_THUC_DIRECTORY = 'kien-thuc-not-generated';
const MINIMAL_CONTENT_FILE = '{}';
const REDIRECT_TARGET_STEP = 6;
const RESERVED_LESSON_SLUG = 'tu-vi-2027';
const UNLISTED_LESSON_SLUG = 'sao-thai-tue';
const INVALID_FILE_SLUG = 'Tu Vi';
const LEGACY_REDIRECT_SOURCES: readonly string[] = [
  '/kien-thuc/tam-hop-luc-xung',
  '/kien-thuc/chon-huong-ban-lam-viec',
];

interface ManifestContent {
  readonly viewYear: number;
  readonly conGiap: readonly string[];
  readonly tuoiNam: readonly string[];
}

const MANIFEST: ManifestContent = {
  viewYear: 2027,
  conGiap: CON_GIAP_SLUGS,
  tuoiNam: TUOI_NAM_SLUGS,
};
interface ContentRef {
  readonly kind: ContentKind;
  readonly slug: string;
}

const TERM_REDIRECT_TARGET: ManifestEntry = {
  kind: ContentKind.ThuatNgu,
  group: EntryGroup.ThuatNgu,
  slug: 'tam-hop-luc-xung',
  title: 'Tam hợp, lục xung',
  learnInLesson: 'tam-hop-xung-chieu',
  reviewedAt: '2026-11-18',
};
const LESSON_REDIRECT_TARGET: ManifestLesson = {
  slug: 'phong-thuy-va-tu-vi',
  order: 4,
  title: 'Phong thủy và tử vi',
  readingMinutes: 3,
  reviewedAt: '2026-11-18',
};
const FIXTURE_MANIFEST = JSON.parse(
  readFileSync(join(KIEN_THUC_FIXTURES_DIRECTORY, KIEN_THUC_MANIFEST_FILE), 'utf8'),
) as KienThucManifest;
const PUBLISHED_MANIFEST: KienThucManifest = {
  steps: FIXTURE_MANIFEST.steps.map((step) =>
    step.step === REDIRECT_TARGET_STEP
      ? { ...step, lessons: [...step.lessons, LESSON_REDIRECT_TARGET] }
      : step,
  ),
  entries: [...FIXTURE_MANIFEST.entries, TERM_REDIRECT_TARGET],
};
const PUBLISHED_KIEN_THUC_PATHS: readonly string[] = [
  '/kien-thuc',
  '/kien-thuc/sao',
  '/kien-thuc/cung',
  '/kien-thuc/thuat-ngu',
  '/kien-thuc/tu-vi-la-gi',
  '/kien-thuc/la-so-tu-vi-gom-nhung-gi',
  '/kien-thuc/am-duong-ngu-hanh-co-ban',
  '/kien-thuc/12-cung-tu-vi',
  '/kien-thuc/doc-la-so-cua-chinh-ban',
  '/kien-thuc/phong-thuy-va-tu-vi',
  '/kien-thuc/sao/thien-co',
  '/kien-thuc/sao/ta-phu',
  '/kien-thuc/sao/dia-kiep',
  '/kien-thuc/cung/menh',
  '/kien-thuc/cung/thien-di',
  '/kien-thuc/thuat-ngu/hanh-kim',
  '/kien-thuc/thuat-ngu/can',
  '/kien-thuc/thuat-ngu/cuc',
  '/kien-thuc/thuat-ngu/tam-hop-luc-xung',
];
const SEO_ROUTES_URL = pathToFileURL(join(__dirname, 'seo-routes.mjs')).href;
const RUNNER_SCRIPT = `
import { getSeoRoutes } from ${JSON.stringify(SEO_ROUTES_URL)};
try {
  console.log(JSON.stringify({ routes: getSeoRoutes(JSON.parse(process.argv[1])) }));
} catch (error) {
  console.log(JSON.stringify({ failure: { name: error.name, message: error.message } }));
}
`;

const SITEMAP_RUNNER_SCRIPT = `
import { getSitemapEntries } from ${JSON.stringify(SEO_ROUTES_URL)};
try {
  console.log(JSON.stringify({ entries: getSitemapEntries(JSON.parse(process.argv[1])) }));
} catch (error) {
  console.log(JSON.stringify({ failure: { name: error.name, message: error.message } }));
}
`;

interface LegacyRedirect {
  readonly from: string;
  readonly to: string;
}

interface SeoRoutesOptions {
  readonly manifestPath: string;
  readonly vanHanYears: readonly number[];
  readonly kienThucDirectory: string;
  readonly legacyRedirects?: readonly LegacyRedirect[];
}

interface SitemapEntry {
  readonly path: string;
  readonly lastModified?: string;
}

interface SitemapOutput {
  readonly entries?: readonly SitemapEntry[];
  readonly failure?: SeoRoutesFailure;
}

interface SeoRoutesRun {
  readonly routes: readonly string[];
}

interface SeoRoutesFailure {
  readonly name: string;
  readonly message: string;
}

interface SeoRoutesOutput extends Partial<SeoRoutesRun> {
  readonly failure?: SeoRoutesFailure;
}

let directory: string;

function runScript(script: string, options: SeoRoutesOptions): unknown {
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', script, JSON.stringify(options)],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return JSON.parse(output);
}

function runRoutes(options: SeoRoutesOptions): SeoRoutesOutput {
  return runScript(RUNNER_SCRIPT, options) as SeoRoutesOutput;
}

function runSitemapEntries(options: SeoRoutesOptions): SitemapOutput {
  return runScript(SITEMAP_RUNNER_SCRIPT, options) as SitemapOutput;
}

function requireRoutes({ routes, failure }: SeoRoutesOutput): SeoRoutesRun {
  if (!routes) {
    throw new Error(`seo-routes failed: ${failure?.message}`);
  }
  return { routes };
}

function tetHubOptions(manifestPath: string, vanHanYears: readonly number[]): SeoRoutesOptions {
  return {
    manifestPath,
    vanHanYears,
    kienThucDirectory: join(directory, UNGENERATED_KIEN_THUC_DIRECTORY),
    legacyRedirects: [],
  };
}

function kienThucOptions(
  kienThucDirectory: string,
  legacyRedirects?: readonly LegacyRedirect[],
): SeoRoutesOptions {
  return {
    manifestPath: join(directory, MANIFEST_FILE_NAME),
    vanHanYears: [],
    kienThucDirectory,
    legacyRedirects,
  };
}

function runSitemap(manifestPath: string, vanHanYears: readonly number[] = []): SitemapOutput {
  return runSitemapEntries(tetHubOptions(manifestPath, vanHanYears));
}

function runSeoRoutes(manifestPath: string, vanHanYears: readonly number[] = []): SeoRoutesRun {
  return requireRoutes(runRoutes(tetHubOptions(manifestPath, vanHanYears)));
}

function runSeoRoutesFailure(manifestPath: string): SeoRoutesFailure | undefined {
  return runRoutes(tetHubOptions(manifestPath, [])).failure;
}

function runKienThucRoutes(
  kienThucDirectory: string,
  legacyRedirects?: readonly LegacyRedirect[],
): readonly string[] {
  return requireRoutes(runRoutes(kienThucOptions(kienThucDirectory, legacyRedirects))).routes;
}

function runKienThucFailure(
  kienThucDirectory: string,
  legacyRedirects?: readonly LegacyRedirect[],
): SeoRoutesFailure | undefined {
  return runRoutes(kienThucOptions(kienThucDirectory, legacyRedirects)).failure;
}

function runKienThucSitemap(kienThucDirectory: string): readonly SitemapEntry[] {
  const { entries, failure } = runSitemapEntries(kienThucOptions(kienThucDirectory));
  if (!entries) {
    throw new Error(`seo-routes sitemap failed: ${failure?.message}`);
  }
  return entries;
}

function writeManifest(content: string): string {
  const manifestPath = join(directory, MANIFEST_FILE_NAME);
  writeFileSync(manifestPath, content);
  return manifestPath;
}

function writePages(slugs: readonly string[]): void {
  slugs.forEach((slug) => writeFileSync(join(directory, `${slug}.json`), '{}'));
}

function writeGeneratedPages(slugs: readonly string[]): void {
  slugs.forEach((slug) =>
    writeFileSync(join(directory, `${slug}.json`), JSON.stringify({ generatedAt: GENERATED_AT })),
  );
}

function writeContent(manifest: ManifestContent): string {
  writePages([...manifest.conGiap, ...manifest.tuoiNam]);
  return writeManifest(JSON.stringify(manifest));
}

function without(slugs: readonly string[], dropped: string): readonly string[] {
  return slugs.filter((slug) => slug !== dropped);
}

function withEntries(
  manifest: KienThucManifest,
  isKept: (entry: ManifestEntry) => boolean,
): KienThucManifest {
  return { ...manifest, entries: manifest.entries.filter(isKept) };
}

function withLessonInFirstStep(manifest: KienThucManifest, slug: string): KienThucManifest {
  const [firstStep, ...otherSteps] = manifest.steps;
  return {
    ...manifest,
    steps: [
      { ...firstStep, lessons: [...firstStep.lessons, { ...LESSON_REDIRECT_TARGET, slug }] },
      ...otherSteps,
    ],
  };
}

function manifestRefs(manifest: KienThucManifest): readonly ContentRef[] {
  return [
    ...manifest.steps.flatMap((step) =>
      step.lessons.map(({ slug }) => ({ kind: ContentKind.Bai, slug })),
    ),
    ...manifest.entries.map(({ kind, slug }) => ({ kind, slug })),
  ];
}

function isSameRef(ref: ContentRef, other: ContentRef): boolean {
  return ref.kind === other.kind && ref.slug === other.slug;
}

function kienThucDirectory(): string {
  return join(directory, KIEN_THUC_CONTENT_DIRECTORY);
}

function contentFileOf({ kind, slug }: ContentRef): string {
  return join(kienThucDirectory(), kind, `${slug}.json`);
}

function fixtureContent({ kind, slug }: ContentRef): string {
  const fixturePath = join(KIEN_THUC_FIXTURES_DIRECTORY, `${kind}-${slug}.json`);
  return existsSync(fixturePath) ? readFileSync(fixturePath, 'utf8') : MINIMAL_CONTENT_FILE;
}

function writeKienThucFiles(refs: readonly ContentRef[]): void {
  refs.forEach((ref) => {
    mkdirSync(join(kienThucDirectory(), ref.kind), { recursive: true });
    writeFileSync(contentFileOf(ref), fixtureContent(ref));
  });
}

function writeKienThucManifest(content: string): string {
  mkdirSync(kienThucDirectory(), { recursive: true });
  writeFileSync(join(kienThucDirectory(), KIEN_THUC_MANIFEST_FILE), content);
  return kienThucDirectory();
}

function writeKienThucContent(
  manifest: KienThucManifest,
  files: readonly ContentRef[] = manifestRefs(manifest),
): string {
  writeKienThucFiles(files);
  return writeKienThucManifest(JSON.stringify(manifest));
}

function isKienThucRoute(route: string): boolean {
  const isTetHubRoute = route === TET_HUB_PATH || route.startsWith(`${TET_HUB_PATH}/`);
  return !isTetHubRoute && (route === KIEN_THUC_PATH || route.startsWith(`${KIEN_THUC_PATH}/`));
}

function sorted(paths: readonly string[]): readonly string[] {
  return [...paths].sort();
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'seo-routes-'));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe('getSeoRoutes', () => {
  it('lists the hub and every con giáp and birth-year page of a complete manifest', () => {
    const { routes } = runSeoRoutes(writeContent(MANIFEST));

    expect(routes.filter((route) => route.startsWith(TET_HUB_PATH))).toEqual([
      TET_HUB_PATH,
      ...CON_GIAP_SLUGS.map(tetHubPagePath),
      ...TUOI_NAM_SLUGS.map(tetHubPagePath),
    ]);
  });

  it('lists only the hub when the content directory is empty', () => {
    const { routes } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME));

    expect(routes.filter((route) => route.startsWith(TET_HUB_PATH))).toEqual([TET_HUB_PATH]);
  });

  it('lists only the hub when the content directory does not exist', () => {
    const { routes } = runSeoRoutes(join(directory, 'not-generated', MANIFEST_FILE_NAME));

    expect(routes.filter((route) => route.startsWith(TET_HUB_PATH))).toEqual([TET_HUB_PATH]);
  });

  it('lists only the hub when the content directory holds only the hub intro', () => {
    writeFileSync(join(directory, 'hub.json'), '{}');

    const { routes } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME));

    expect(routes.filter((route) => route.startsWith(TET_HUB_PATH))).toEqual([TET_HUB_PATH]);
  });

  it('fails when a birth-year page exists without a manifest', () => {
    writePages([MISSING_TUOI_NAM_SLUG]);
    const manifestPath = join(directory, MANIFEST_FILE_NAME);

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(
        `${manifestPath} is malformed: pages without a manifest (${MISSING_TUOI_NAM_SLUG})`,
      ),
    });
  });

  it('fails when a con giáp page exists without a manifest', () => {
    writePages([MISSING_CON_GIAP_SLUG]);
    const manifestPath = join(directory, MANIFEST_FILE_NAME);

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(
        `${manifestPath} is malformed: pages without a manifest (${MISSING_CON_GIAP_SLUG})`,
      ),
    });
  });

  it('has no duplicate routes', () => {
    const { routes } = runSeoRoutes(writeContent(MANIFEST));

    expect(new Set(routes).size).toBe(routes.length);
  });

  it('fails naming the file when the manifest is not valid JSON', () => {
    const manifestPath = writeManifest('{ not json');

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(manifestPath),
    });
  });

  it('fails naming the file when the manifest lacks the slug lists', () => {
    const manifestPath = writeManifest(JSON.stringify({ viewYear: 2027 }));

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(`${manifestPath} is malformed: conGiap and tuoiNam`),
    });
  });
});

describe('getSeoRoutes for Vận hạn', () => {
  it('lists a Vận hạn page for every con giáp', () => {
    const { routes } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME));

    expect(routes.filter((route) => route.startsWith('/van-han/'))).toEqual(VAN_HAN_ZODIAC_PATHS);
  });

  it('adds a page for every con giáp in every published year', () => {
    const { routes } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME), PUBLISHED_VAN_HAN_YEARS);

    expect(routes.filter((route) => route.startsWith('/van-han/'))).toEqual([
      ...VAN_HAN_ZODIAC_PATHS,
      ...CON_GIAP_SLUGS.map((slug) => `/van-han/2027/${slug}`),
      ...CON_GIAP_SLUGS.map((slug) => `/van-han/2026/${slug}`),
    ]);
  });
});

describe('getSeoRoutes with an incomplete Tết hub', () => {
  it('fails naming the con giáp page the manifest does not list', () => {
    const manifestPath = writeContent({
      ...MANIFEST,
      conGiap: without(CON_GIAP_SLUGS, MISSING_CON_GIAP_SLUG),
    });

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(
        `${manifestPath} is malformed: conGiap is missing ${MISSING_CON_GIAP_SLUG}`,
      ),
    });
  });

  it('fails naming the birth-year page the manifest does not list', () => {
    const manifestPath = writeContent({
      ...MANIFEST,
      tuoiNam: without(TUOI_NAM_SLUGS, MISSING_TUOI_NAM_SLUG),
    });

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(
        `${manifestPath} is malformed: tuoiNam is missing ${MISSING_TUOI_NAM_SLUG}`,
      ),
    });
  });

  it('fails naming a slug that is not a page of the hub', () => {
    const manifestPath = writeContent({ ...MANIFEST, tuoiNam: [...TUOI_NAM_SLUGS, UNKNOWN_SLUG] });

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(
        `${manifestPath} is malformed: tuoiNam lists unknown slugs ${UNKNOWN_SLUG}`,
      ),
    });
  });

  it('fails naming a listed page whose file is not next to the manifest', () => {
    writePages([...CON_GIAP_SLUGS, ...without(TUOI_NAM_SLUGS, MISSING_TUOI_NAM_SLUG)]);
    const manifestPath = writeManifest(JSON.stringify(MANIFEST));

    expect(runSeoRoutesFailure(manifestPath)).toEqual({
      name: 'TetHubManifestError',
      message: expect.stringContaining(
        `${manifestPath} is malformed: no page file for ${MISSING_TUOI_NAM_SLUG}`,
      ),
    });
  });
});

describe('getSeoRoutes for Kiến thức', () => {
  it('lists every published lesson, entry and non-empty index', () => {
    const routes = runKienThucRoutes(writeKienThucContent(PUBLISHED_MANIFEST));

    expect(sorted(routes.filter(isKienThucRoute))).toEqual(sorted(PUBLISHED_KIEN_THUC_PATHS));
  });

  it('leaves out the index of a kind with no published entry', () => {
    const manifest = withEntries(PUBLISHED_MANIFEST, (entry) => entry.kind !== ContentKind.Cung);

    const routes = runKienThucRoutes(writeKienThucContent(manifest));

    expect(routes).not.toContain('/kien-thuc/cung');
    expect(routes).toContain('/kien-thuc/sao');
  });

  it('lists no Kiến thức page beyond /kien-thuc when there is no manifest and no file', () => {
    const routes = runKienThucRoutes(kienThucDirectory(), []);

    expect(routes.filter(isKienThucRoute)).toEqual([KIEN_THUC_PATH]);
    expect(routes).toContain('/ngay-tot');
  });

  it('fails on the legacy redirects when no Kiến thức page is published', () => {
    expect(runKienThucFailure(kienThucDirectory())).toEqual({
      name: 'LegacyRedirectError',
      message: expect.stringContaining('/kien-thuc/thuat-ngu/tam-hop-luc-xung'),
    });
  });

  it('fails naming a manifest page that has no file', () => {
    const missing: ContentRef = { kind: ContentKind.Sao, slug: 'thien-co' };
    const directoryPath = writeKienThucContent(
      PUBLISHED_MANIFEST,
      manifestRefs(PUBLISHED_MANIFEST).filter((ref) => !isSameRef(ref, missing)),
    );

    expect(runKienThucFailure(directoryPath)).toEqual({
      name: 'KienThucManifestError',
      message: expect.stringContaining('no content file for sao/thien-co.json'),
    });
  });

  it('fails naming a content file the manifest does not list', () => {
    const directoryPath = writeKienThucContent(PUBLISHED_MANIFEST, [
      ...manifestRefs(PUBLISHED_MANIFEST),
      { kind: ContentKind.Bai, slug: UNLISTED_LESSON_SLUG },
    ]);

    expect(runKienThucFailure(directoryPath)).toEqual({
      name: 'KienThucManifestError',
      message: expect.stringContaining(`does not list bai/${UNLISTED_LESSON_SLUG}.json`),
    });
  });

  it('fails naming content files that exist without a manifest', () => {
    writeKienThucFiles([{ kind: ContentKind.Sao, slug: 'thien-co' }]);

    expect(runKienThucFailure(kienThucDirectory(), [])).toEqual({
      name: 'KienThucManifestError',
      message: expect.stringContaining('content files without a manifest (sao/thien-co.json)'),
    });
  });

  it('fails naming a content file whose name is not a slug', () => {
    writeKienThucFiles([{ kind: ContentKind.Sao, slug: INVALID_FILE_SLUG }]);

    expect(runKienThucFailure(kienThucDirectory(), [])).toEqual({
      name: 'KienThucContentFileError',
      message: expect.stringContaining(
        contentFileOf({ kind: ContentKind.Sao, slug: INVALID_FILE_SLUG }),
      ),
    });
  });

  it('fails naming a lesson whose slug is reserved', () => {
    const directoryPath = writeKienThucContent(
      withLessonInFirstStep(PUBLISHED_MANIFEST, RESERVED_LESSON_SLUG),
    );

    expect(runKienThucFailure(directoryPath)).toEqual({
      name: 'KienThucManifestError',
      message: expect.stringContaining(`reserved lesson slugs ${RESERVED_LESSON_SLUG}`),
    });
  });

  it('fails naming the manifest when it is not valid JSON', () => {
    const directoryPath = writeKienThucManifest('{ not json');

    expect(runKienThucFailure(directoryPath, [])).toEqual({
      name: 'KienThucManifestError',
      message: expect.stringContaining(join(directoryPath, KIEN_THUC_MANIFEST_FILE)),
    });
  });

  it('fails naming the manifest when it lacks the steps or the entries', () => {
    const directoryPath = writeKienThucManifest(JSON.stringify({ steps: [] }));

    expect(runKienThucFailure(directoryPath, [])).toEqual({
      name: 'KienThucManifestError',
      message: expect.stringContaining(
        `${join(directoryPath, KIEN_THUC_MANIFEST_FILE)} is malformed: steps and entries`,
      ),
    });
  });

  it('fails naming a redirect whose target is not published', () => {
    const manifest = withEntries(
      PUBLISHED_MANIFEST,
      (entry) => entry.slug !== TERM_REDIRECT_TARGET.slug,
    );

    expect(runKienThucFailure(writeKienThucContent(manifest))).toEqual({
      name: 'LegacyRedirectError',
      message: expect.stringContaining('/kien-thuc/thuat-ngu/tam-hop-luc-xung'),
    });
  });

  it('never lists the old articles that now redirect', () => {
    const routes = runKienThucRoutes(writeKienThucContent(PUBLISHED_MANIFEST));

    expect(routes.filter((route) => LEGACY_REDIRECT_SOURCES.includes(route))).toEqual([]);
  });
});

describe('getSitemapEntries for Kiến thức', () => {
  it('dates each lesson and entry by its review in the sitemap', () => {
    const entries = runKienThucSitemap(writeKienThucContent(PUBLISHED_MANIFEST));

    expect(entries).toContainEqual({
      path: '/kien-thuc/sao/thien-co',
      lastModified: FIXTURE_MANIFEST.entries.find((entry) => entry.slug === 'thien-co')?.reviewedAt,
    });
    expect(entries).toContainEqual({
      path: '/kien-thuc/phong-thuy-va-tu-vi',
      lastModified: LESSON_REDIRECT_TARGET.reviewedAt,
    });
  });

  it('leaves a Kiến thức index undated', () => {
    const entries = runKienThucSitemap(writeKienThucContent(PUBLISHED_MANIFEST));

    expect(entries).toContainEqual({ path: '/kien-thuc/sao' });
  });
});

describe('getSitemapEntries', () => {
  it('dates every Tết hub page by when its content was generated', () => {
    writeGeneratedPages([...CON_GIAP_SLUGS, ...TUOI_NAM_SLUGS]);
    const { entries = [] } = runSitemap(writeManifest(JSON.stringify(MANIFEST)));

    const hubPages = entries.filter((entry) => entry.path.startsWith(`${TET_HUB_PATH}/`));
    expect(hubPages).toHaveLength(CON_GIAP_SLUGS.length + TUOI_NAM_SLUGS.length);
    expect(hubPages).toContainEqual({
      path: tetHubPagePath(MISSING_TUOI_NAM_SLUG),
      lastModified: GENERATED_AT,
    });
    hubPages.forEach((entry) => expect(entry.lastModified).toBe(GENERATED_AT));
  });

  it('leaves a route with no known change date undated', () => {
    writeGeneratedPages([...CON_GIAP_SLUGS, ...TUOI_NAM_SLUGS]);
    const { entries = [] } = runSitemap(writeManifest(JSON.stringify(MANIFEST)));

    expect(entries).toContainEqual({ path: '/' });
    expect(entries).toContainEqual({ path: TET_HUB_PATH });
  });

  it('lists the same routes as getSeoRoutes', () => {
    writeGeneratedPages([...CON_GIAP_SLUGS, ...TUOI_NAM_SLUGS]);
    const manifestPath = writeManifest(JSON.stringify(MANIFEST));

    const { entries = [] } = runSitemap(manifestPath);

    expect(entries.map((entry) => entry.path)).toEqual(runSeoRoutes(manifestPath).routes);
  });

  it('lists the con giáp pages of each year instead of the ones without a year, which point to them', () => {
    writeGeneratedPages([...CON_GIAP_SLUGS, ...TUOI_NAM_SLUGS]);
    const manifestPath = writeManifest(JSON.stringify(MANIFEST));

    const paths = (runSitemap(manifestPath, PUBLISHED_VAN_HAN_YEARS).entries ?? []).map(
      (entry) => entry.path,
    );

    expect(paths.filter((path) => path.startsWith('/van-han/'))).toEqual([
      ...CON_GIAP_SLUGS.map((slug) => `/van-han/2027/${slug}`),
      ...CON_GIAP_SLUGS.map((slug) => `/van-han/2026/${slug}`),
    ]);
    expect(paths).toContain('/van-han');
  });

  it('fails naming the page file that has no generation time', () => {
    const manifestPath = writeContent(MANIFEST);

    expect(runSitemap(manifestPath).failure).toEqual({
      name: 'TetHubPageError',
      message: expect.stringContaining(join(directory, `${CON_GIAP_SLUGS[0]}.json`)),
    });
  });
});
