import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { tuoiNamBirthYears, tuoiNamSlug } from '@org/shared-tu-vi';
import { isRecord } from '../schema-guards';
import { pageExists, pageFileName } from './tet-hub-files';
import { isTuoiNamDraft } from './tuoi-nam/tuoi-nam.schema';

export class MalformedTuoiNamArticleError extends Error {
  constructor(
    readonly fileName: string,
    options?: ErrorOptions,
  ) {
    super(`${fileName} is not a valid Tết year-page article`, options);
    this.name = 'MalformedTuoiNamArticleError';
  }
}

function isStoredTuoiNamArticle(value: unknown, expectedSlug: string): value is TuoiNamArticle {
  return (
    isRecord(value) &&
    value.slug === expectedSlug &&
    typeof value.birthYear === 'number' &&
    tuoiNamSlug(value.birthYear) === expectedSlug &&
    typeof value.viewYear === 'number' &&
    typeof value.model === 'string' &&
    typeof value.generatedAt === 'string' &&
    isTuoiNamDraft(value)
  );
}

async function readTuoiNamArticle(directory: string, slug: string): Promise<TuoiNamArticle> {
  const fileName = pageFileName(slug);
  const text = await readFile(join(directory, fileName), 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new MalformedTuoiNamArticleError(fileName, { cause: error });
  }
  if (!isStoredTuoiNamArticle(parsed, slug)) throw new MalformedTuoiNamArticleError(fileName);
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
