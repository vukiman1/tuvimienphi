import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  ConGiapArticle,
  TetHubIntro,
  TetHubManifest,
  TuoiNamArticle,
} from '@org/shared-contracts';
import { INTRO_FILE, MANIFEST_FILE, pageFileName } from './tet-hub-files';

const JSON_INDENT = 2;
const TEMP_FILE_SUFFIX = 'tmp';

async function writeJson(dir: string, fileName: string, value: unknown): Promise<void> {
  await mkdir(dir, { recursive: true });
  const target = join(dir, fileName);
  const temp = join(dir, `.${fileName}.${randomUUID()}.${TEMP_FILE_SUFFIX}`);
  try {
    await writeFile(temp, `${JSON.stringify(value, null, JSON_INDENT)}\n`, 'utf8');
    await rename(temp, target);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
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
