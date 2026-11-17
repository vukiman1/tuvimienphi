import { join } from 'node:path';
import { parsePageRef, type PageRef } from '@org/shared-contracts';
import { UnknownPageRefError } from '../errors';

export const KIEN_THUC_CONTENT_DIRECTORY = 'apps/frontend/src/features/kien-thuc/content';
export const KIEN_THUC_DRAFTS_DIRECTORY = 'tmp/kien-thuc/drafts';

export interface KienThucDirectories {
  readonly content: string;
  readonly drafts: string;
}

export const KIEN_THUC_DIRECTORIES: KienThucDirectories = {
  content: KIEN_THUC_CONTENT_DIRECTORY,
  drafts: KIEN_THUC_DRAFTS_DIRECTORY,
};

function parse(ref: PageRef): { readonly kind: string; readonly slug: string } {
  const parsed = parsePageRef(ref);
  if (parsed === null) throw new UnknownPageRefError(ref);
  return parsed;
}

export function draftPath(directories: KienThucDirectories, ref: PageRef): string {
  const { kind, slug } = parse(ref);
  return join(directories.drafts, kind, `${slug}.json`);
}

export function contentPath(directory: string, ref: PageRef): string {
  const { kind, slug } = parse(ref);
  return join(directory, kind, `${slug}.json`);
}
