import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { tuoiNamBirthYears, tuoiNamSlug } from '@org/shared-tu-vi';
import { isRecord } from './schema-guards';
import { pageExists, pageFileName } from './tet-hub-files';
import { isTuoiNamDraft } from './tuoi-nam/tuoi-nam.schema';

export class MalformedTuoiNamArticleError extends Error {
  constructor(readonly fileName: string) {
    super(`${fileName} is not a valid Tết year-page article`);
    this.name = 'MalformedTuoiNamArticleError';
  }
}

function isTuoiNamArticle(value: unknown): value is TuoiNamArticle {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.birthYear === 'number' &&
    isTuoiNamDraft(value)
  );
}

async function readTuoiNamArticle(directory: string, slug: string): Promise<TuoiNamArticle> {
  const fileName = pageFileName(slug);
  const parsed: unknown = JSON.parse(await readFile(join(directory, fileName), 'utf8'));
  if (!isTuoiNamArticle(parsed)) throw new MalformedTuoiNamArticleError(fileName);
  return parsed;
}

export function readTuoiNamArticles(directory: string): Promise<readonly TuoiNamArticle[]> {
  return Promise.all(
    tuoiNamBirthYears()
      .map(tuoiNamSlug)
      .filter((slug) => pageExists(directory, slug))
      .map((slug) => readTuoiNamArticle(directory, slug)),
  );
}
