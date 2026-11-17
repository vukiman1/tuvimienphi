import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ContentKind, pageRef, type PageRef } from '@org/shared-contracts';
import { isRecord } from '../../schema-guards';
import { MalformedDraftError, MissingDraftError } from '../errors';
import { keepFirstLinkPerTarget } from '../text/link-markup';
import { isDraftFile, offendingDraftKey, type DraftFile } from './draft-file';
import { listJsonSlugs, parseJson, readTextIfPresent } from './json-files';
import { draftPath, type KienThucDirectories } from './kien-thuc-paths';

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
  const raw = await readTextIfPresent(path);
  if (raw === null) throw new MissingDraftError(path);
  const parsed = parseJson(
    raw,
    (reason) => new MalformedDraftError(path, `JSON không đọc được (${reason})`),
  );
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
    for (const slug of await listJsonSlugs(join(directories.drafts, kind))) {
      refs.push(pageRef(kind, slug));
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
