import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TET_HUB_PATH, TET_HUB_SLUG, tetHubPagePath } from '../src/features/tet-hub/tet-hub-paths';

const MANIFEST_FILE_NAME = 'manifest.json';
const MANIFEST = {
  viewYear: 2027,
  conGiap: ['tuoi-dan', 'tuoi-ty'],
  tuoiNam: ['tuoi-binh-dan-1986'],
};
const SEO_ROUTES_URL = pathToFileURL(join(__dirname, 'seo-routes.mjs')).href;
const RUNNER_SCRIPT = `
import { getArticleSlugs, getSeoRoutes } from ${JSON.stringify(SEO_ROUTES_URL)};
const manifestPath = process.argv[1];
console.log(JSON.stringify({ routes: getSeoRoutes({ manifestPath }), slugs: getArticleSlugs() }));
`;

interface SeoRoutesRun {
  readonly routes: readonly string[];
  readonly slugs: readonly string[];
}

let directory: string;

function runSeoRoutes(manifestPath: string): SeoRoutesRun {
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', RUNNER_SCRIPT, manifestPath],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return JSON.parse(output) as SeoRoutesRun;
}

function writeManifest(content: string): string {
  const manifestPath = join(directory, MANIFEST_FILE_NAME);
  writeFileSync(manifestPath, content);
  return manifestPath;
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'seo-routes-'));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe('getSeoRoutes', () => {
  it('lists the hub and every manifest slug', () => {
    const { routes } = runSeoRoutes(writeManifest(JSON.stringify(MANIFEST)));

    expect(routes).toEqual(
      expect.arrayContaining([
        TET_HUB_PATH,
        tetHubPagePath('tuoi-dan'),
        tetHubPagePath('tuoi-ty'),
        tetHubPagePath('tuoi-binh-dan-1986'),
      ]),
    );
  });

  it('lists only the hub when the manifest has not been generated yet', () => {
    const { routes } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME));

    expect(routes.filter((route) => route.startsWith(TET_HUB_PATH))).toEqual([TET_HUB_PATH]);
  });

  it('has no duplicate routes', () => {
    const { routes } = runSeoRoutes(writeManifest(JSON.stringify(MANIFEST)));

    expect(new Set(routes).size).toBe(routes.length);
  });

  it('fails naming the file when the manifest is not valid JSON', () => {
    const manifestPath = writeManifest('{ not json');

    expect(() => runSeoRoutes(manifestPath)).toThrow(manifestPath);
  });

  it('fails naming the file when the manifest lacks the slug lists', () => {
    const manifestPath = writeManifest(JSON.stringify({ viewYear: 2027 }));

    expect(() => runSeoRoutes(manifestPath)).toThrow(manifestPath);
  });
});

describe('getArticleSlugs', () => {
  it('does not give any Kiến thức article the hub slug', () => {
    const { slugs } = runSeoRoutes(join(directory, MANIFEST_FILE_NAME));

    expect(slugs).not.toContain(TET_HUB_SLUG);
  });
});
