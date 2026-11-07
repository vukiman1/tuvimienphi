import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PREVIEW_SCRIPT = join(__dirname, 'tet-hub-preview.mjs');
const FIXTURE_FILE = join(
  __dirname,
  '../src/features/tet-hub/__fixtures__/tuoi-binh-dan-1986.json',
);
const PAGE_FILE_NAME = 'tuoi-binh-dan-1986.json';
const OUTPUT_FILE_NAME = 'preview.html';
const SCRIPT_TAG = '<script>alert(1)</script>';

let directory: string;

function runPreview(): SpawnSyncReturns<string> {
  return spawnSync(
    process.execPath,
    [PREVIEW_SCRIPT, directory, join(directory, OUTPUT_FILE_NAME)],
    { encoding: 'utf8' },
  );
}

function readOutput(): string {
  return readFileSync(join(directory, OUTPUT_FILE_NAME), 'utf8');
}

function writePage(overrides: Record<string, unknown>): void {
  const page = JSON.parse(readFileSync(FIXTURE_FILE, 'utf8')) as Record<string, unknown>;
  writeFileSync(join(directory, PAGE_FILE_NAME), JSON.stringify({ ...page, ...overrides }));
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'tet-hub-preview-'));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe('tet-hub-preview', () => {
  it('lists the slug and the facts of a year page', () => {
    copyFileSync(FIXTURE_FILE, join(directory, PAGE_FILE_NAME));

    const result = runPreview();

    expect(result.status).toBe(0);
    expect(readOutput()).toEqual(
      expect.stringContaining('<h2>tuoi-binh-dan-1986</h2><dl><dt>Tuổi</dt><dd>Bính Dần</dd>'),
    );
  });

  it('escapes article text', () => {
    writePage({ tongQuan: [SCRIPT_TAG] });

    runPreview();

    expect(readOutput()).not.toContain(SCRIPT_TAG);
    expect(readOutput()).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('exits non-zero when the directory has no year pages', () => {
    const result = runPreview();

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`No year pages found in ${directory}`);
  });

  it('fails naming the file when a page is not valid JSON', () => {
    writeFileSync(join(directory, PAGE_FILE_NAME), '{ not json');

    const result = runPreview();

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Cannot parse ${join(directory, PAGE_FILE_NAME)}`);
  });

  it('fails naming the file when a page lacks its FAQ', () => {
    writePage({ faq: undefined });

    const result = runPreview();

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`${join(directory, PAGE_FILE_NAME)} is missing a valid "faq"`);
  });
});
