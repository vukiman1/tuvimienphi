import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ConGiapArticle, TetHubManifest, TuoiNamArticle } from '@org/shared-contracts';
import { INTRO_FILE, MANIFEST_FILE, pageFileName } from './tet-hub-files';

const JSON_INDENT = 2;

export interface TetHubIntro {
  readonly intro: readonly string[];
}

async function writeJson(dir: string, fileName: string, value: unknown): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), `${JSON.stringify(value, null, JSON_INDENT)}\n`, 'utf8');
}

export function writeTetHubPage(
  dir: string,
  article: TuoiNamArticle | ConGiapArticle,
): Promise<void> {
  return writeJson(dir, pageFileName(article.slug), article);
}

export function writeTetHubManifest(dir: string, manifest: TetHubManifest): Promise<void> {
  return writeJson(dir, MANIFEST_FILE, {
    viewYear: manifest.viewYear,
    conGiap: [...manifest.conGiap].sort(),
    tuoiNam: [...manifest.tuoiNam].sort(),
  });
}

export function writeTetHubIntro(dir: string, intro: TetHubIntro): Promise<void> {
  return writeJson(dir, INTRO_FILE, intro);
}
