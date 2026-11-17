import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ContentKind, pageRef, type PageRef } from '@org/shared-contracts';
import { isRecord } from '../../schema-guards';
import { MalformedDraftError, MissingDraftError } from '../errors';
import { keepFirstLinkPerTarget } from '../text/link-markup';
import { isDraftFile, offendingDraftKey, type DraftFile } from './draft-file';
import { draftPath, type KienThucDirectories } from './kien-thuc-paths';

const JSON_SUFFIX = '.json';
const DRAFT_KINDS: readonly ContentKind[] = [
  ContentKind.Bai,
  ContentKind.Sao,
  ContentKind.Cung,
  ContentKind.ThuatNgu,
];

export interface StoredDraft {
  readonly ref: PageRef;
  readonly draft: DraftFile;
}

function parseDraft(path: string, raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new MalformedDraftError(path, `JSON không đọc được (${error.message})`);
    }
    throw error;
  }
}

export async function readDraft(
  directories: KienThucDirectories,
  ref: PageRef,
): Promise<DraftFile> {
  const path = draftPath(directories, ref);
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new MissingDraftError(path);
  }
  const parsed = parseDraft(path, raw);
  if (!isDraftFile(parsed)) {
    const key = isRecord(parsed) ? offendingDraftKey(parsed) : 'root';
    throw new MalformedDraftError(path, `khóa "${key}"`);
  }
  return { ...parsed, sections: keepFirstLinkPerTarget(parsed.sections) };
}

export function draftExists(directories: KienThucDirectories, ref: PageRef): boolean {
  return existsSync(draftPath(directories, ref));
}

export async function listDraftRefs(directories: KienThucDirectories): Promise<readonly PageRef[]> {
  const refs: PageRef[] = [];
  for (const kind of DRAFT_KINDS) {
    let files: readonly string[];
    try {
      files = await readdir(join(directories.drafts, kind));
    } catch {
      continue;
    }
    for (const file of [...files].filter((name) => name.endsWith(JSON_SUFFIX)).sort()) {
      refs.push(pageRef(kind, file.slice(0, -JSON_SUFFIX.length)));
    }
  }
  return refs;
}

export async function readAllDrafts(
  directories: KienThucDirectories,
): Promise<readonly StoredDraft[]> {
  const stored: StoredDraft[] = [];
  for (const ref of await listDraftRefs(directories)) {
    stored.push({ ref, draft: await readDraft(directories, ref) });
  }
  return stored;
}
