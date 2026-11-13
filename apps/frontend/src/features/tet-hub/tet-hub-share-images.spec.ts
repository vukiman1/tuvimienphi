import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import { TET_HUB_SLUG, tetHubShareImagePath } from './tet-hub-paths';

const PUBLIC_DIRECTORY = join(__dirname, '../../../public');
const MANIFEST_FILE = join(__dirname, `content/${TET_HUB_VIEW_YEAR}/manifest.json`);

function isStringList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function manifestSlugs(): readonly string[] {
  const manifest: unknown = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
  if (typeof manifest !== 'object' || manifest === null) return [];
  const conGiap: unknown = 'conGiap' in manifest ? manifest.conGiap : [];
  const tuoiNam: unknown = 'tuoiNam' in manifest ? manifest.tuoiNam : [];
  return [...(isStringList(conGiap) ? conGiap : []), ...(isStringList(tuoiNam) ? tuoiNam : [])];
}

describe('Tết hub share images', () => {
  it('ships a card image for the hub and every generated page', () => {
    const slugs = [TET_HUB_SLUG, ...manifestSlugs()];

    const missing = slugs.filter(
      (slug) => !existsSync(join(PUBLIC_DIRECTORY, tetHubShareImagePath(slug))),
    );

    expect(slugs.length).toBe(74);
    expect(missing).toEqual([]);
  });
});
