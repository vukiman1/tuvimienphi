import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHI, conGiapSlug, tuoiNamBirthYears, tuoiNamSlug } from '@org/shared-tu-vi';
import { TET_HUB_PATH, TET_HUB_SLUG, tetHubPagePath } from '../src/features/tet-hub/tet-hub-paths';

const MANIFEST_FILE_NAME = 'manifest.json';
const CON_GIAP_SLUGS: readonly string[] = CHI.map((_, chi) => conGiapSlug(chi));
const TUOI_NAM_SLUGS: readonly string[] = tuoiNamBirthYears().map(tuoiNamSlug);
const MISSING_CON_GIAP_SLUG = 'tuoi-ti';
const MISSING_TUOI_NAM_SLUG = 'tuoi-binh-dan-1986';
const UNKNOWN_SLUG = 'tuoi-binh-dan-1926';
const GENERATED_AT = '2026-11-08T08:45:17.999Z';

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
const SEO_ROUTES_URL = pathToFileURL(join(__dirname, 'seo-routes.mjs')).href;
const RUNNER_SCRIPT = `
import { getArticleSlugs, getSeoRoutes } from ${JSON.stringify(SEO_ROUTES_URL)};
const manifestPath = process.argv[1];
try {
  console.log(JSON.stringify({ routes: getSeoRoutes({ manifestPath }), slugs: getArticleSlugs() }));
} catch (error) {
  console.log(JSON.stringify({ failure: { name: error.name, message: error.message } }));
}
`;

const SITEMAP_RUNNER_SCRIPT = `
import { getSitemapEntries } from ${JSON.stringify(SEO_ROUTES_URL)};
try {
  console.log(JSON.stringify({ entries: getSitemapEntries({ manifestPath: process.argv[1] }) }));
} catch (error) {
  console.log(JSON.stringify({ failure: { name: error.name, message: error.message } }));
}
`;

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
  readonly slugs: readonly string[];
}

interface SeoRoutesFailure {
  readonly name: string;
  readonly message: string;
}

interface SeoRoutesOutput extends Partial<SeoRoutesRun> {
  readonly failure?: SeoRoutesFailure;
}

let directory: string;

function runScript(script: string, manifestPath: string): unknown {
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', script, manifestPath],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return JSON.parse(output);
}

function runRunner(manifestPath: string): SeoRoutesOutput {
  return runScript(RUNNER_SCRIPT, manifestPath) as SeoRoutesOutput;
}

function runSitemap(manifestPath: string): SitemapOutput {
  return runScript(SITEMAP_RUNNER_SCRIPT, manifestPath) as SitemapOutput;
}

function runSeoRoutes(manifestPath: string): SeoRoutesRun {
  const { routes, slugs, failure } = runRunner(manifestPath);
  if (!routes || !slugs) {
    throw new Error(`seo-routes failed: ${failure?.message}`);
  }
  return { routes, slugs };
}

function runSeoRoutesFailure(manifestPath: string): SeoRoutesFailure | undefined {
  return runRunner(manifestPath).failure;
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

describe('getArticleSlugs', () => {
  it('does not give any Kiến thức article the hub slug', () => {
    const { slugs } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME));

    expect(slugs).not.toContain(TET_HUB_SLUG);
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

  it('fails naming the page file that has no generation time', () => {
    const manifestPath = writeContent(MANIFEST);

    expect(runSitemap(manifestPath).failure).toEqual({
      name: 'TetHubPageError',
      message: expect.stringContaining(join(directory, `${CON_GIAP_SLUGS[0]}.json`)),
    });
  });
});
