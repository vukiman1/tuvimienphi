import type {
  ConGiapArticle,
  TetHubIntro,
  TetHubManifest,
  TuoiNamArticle,
} from '@org/shared-contracts';
import { writeJsonFile } from '../write-json-file';
import { INTRO_FILE, MANIFEST_FILE, pageFileName } from './tet-hub-files';

function writeJson(dir: string, fileName: string, value: unknown): Promise<void> {
  return writeJsonFile(dir, fileName, value);
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
