import type {
  ConGiapArticle,
  TetHubIntro,
  TetHubManifest,
  TuoiNamArticle,
} from '@org/shared-contracts';
import { writeJsonFile } from '../write-json-file';
import { INTRO_FILE, MANIFEST_FILE, pageFileName } from './tet-hub-files';

export function writeTetHubPage(
  dir: string,
  article: TuoiNamArticle | ConGiapArticle,
): Promise<void> {
  return writeJsonFile(dir, pageFileName(article.slug), article);
}

export function writeTetHubManifest(dir: string, manifest: TetHubManifest): Promise<void> {
  return writeJsonFile(dir, MANIFEST_FILE, {
    viewYear: manifest.viewYear,
    conGiap: [...manifest.conGiap].sort(),
    tuoiNam: [...manifest.tuoiNam].sort(),
  });
}

export function writeTetHubIntro(dir: string, intro: TetHubIntro): Promise<void> {
  return writeJsonFile(dir, INTRO_FILE, intro);
}
