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
  const parsed = JSON.parse(raw) as unknown;
  if (!isDraftFile(parsed)) {
    throw new MalformedDraftError(path, isRecord(parsed) ? offendingDraftKey(parsed) : 'root');
  }
  return { ...parsed, sections: keepFirstLinkPerTarget(parsed.sections) };
}

export function draftExists(directories: KienThucDirectories, ref: PageRef): boolean {
  return existsSync(draftPath(directories, ref));
}

export async function readAllDrafts(
  directories: KienThucDirectories,
): Promise<readonly StoredDraft[]> {
  const stored: StoredDraft[] = [];
  for (const kind of DRAFT_KINDS) {
    let files: readonly string[];
    try {
      files = await readdir(join(directories.drafts, kind));
    } catch {
      continue;
    }
    for (const file of [...files].filter((name) => name.endsWith(JSON_SUFFIX)).sort()) {
      const ref = pageRef(kind, file.slice(0, -JSON_SUFFIX.length));
      stored.push({ ref, draft: await readDraft(directories, ref) });
    }
  }
  return stored;
}
