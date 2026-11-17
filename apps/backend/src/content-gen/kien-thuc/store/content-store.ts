import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ContentKind,
  KIEN_THUC_MANIFEST_FILE,
  KIEN_THUC_SEARCH_INDEX_FILE,
  type EntryFile,
  type LessonFile,
  type PageRef,
} from '@org/shared-contracts';
import { isRecord, isStringArray } from '../../schema-guards';
import { writeJsonFile } from '../../write-json-file';
import { buildManifest } from '../indexes/build-manifest';
import { buildSearchIndex } from '../indexes/build-search-index';
import { MalformedContentFileError } from '../errors';
import { isSections } from './draft-file';
import { contentPath } from './kien-thuc-paths';

const JSON_SUFFIX = '.json';
const ENTRY_KINDS: readonly ContentKind[] = [
  ContentKind.Sao,
  ContentKind.Cung,
  ContentKind.ThuatNgu,
];

export interface ContentFiles {
  readonly lessons: readonly LessonFile[];
  readonly entries: readonly EntryFile[];
}

function isLessonFile(value: unknown): value is LessonFile {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.step === 'number' &&
    typeof value.order === 'number' &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    isSections(value.sections) &&
    typeof value.readingMinutes === 'number' &&
    typeof value.reviewedAt === 'string'
  );
}

function isEntryFile(value: unknown): value is EntryFile {
  return (
    isRecord(value) &&
    typeof value.kind === 'string' &&
    typeof value.group === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    isStringArray(value.aliases) &&
    typeof value.summary === 'string' &&
    isSections(value.sections) &&
    typeof value.learnInLesson === 'string' &&
    typeof value.reviewedAt === 'string'
  );
}

async function readKind(directory: string, kind: ContentKind): Promise<readonly unknown[]> {
  let files: readonly string[];
  try {
    files = await readdir(join(directory, kind));
  } catch {
    return [];
  }
  const parsed: unknown[] = [];
  for (const file of [...files].filter((name) => name.endsWith(JSON_SUFFIX)).sort()) {
    const path = join(directory, kind, file);
    parsed.push({ path, value: JSON.parse(await readFile(path, 'utf8')) as unknown });
  }
  return parsed;
}

export async function readContent(directory: string): Promise<ContentFiles> {
  const lessons: LessonFile[] = [];
  for (const entry of await readKind(directory, ContentKind.Bai)) {
    const { path, value } = entry as { path: string; value: unknown };
    if (!isLessonFile(value)) throw new MalformedContentFileError(path);
    lessons.push(value);
  }
  const entries: EntryFile[] = [];
  for (const kind of ENTRY_KINDS) {
    for (const item of await readKind(directory, kind)) {
      const { path, value } = item as { path: string; value: unknown };
      if (!isEntryFile(value)) throw new MalformedContentFileError(path);
      entries.push(value);
    }
  }
  return { lessons, entries };
}

export function contentExists(directory: string, ref: PageRef): boolean {
  return existsSync(contentPath(directory, ref));
}

export function writeContentPage(directory: string, page: LessonFile | EntryFile): Promise<void> {
  const kind = 'kind' in page ? page.kind : ContentKind.Bai;
  return writeJsonFile(join(directory, kind), `${page.slug}${JSON_SUFFIX}`, page);
}

export async function writeIndexes(directory: string, files: ContentFiles): Promise<void> {
  await writeJsonFile(directory, KIEN_THUC_MANIFEST_FILE, buildManifest(files));
  await writeJsonFile(directory, KIEN_THUC_SEARCH_INDEX_FILE, buildSearchIndex(files));
}
