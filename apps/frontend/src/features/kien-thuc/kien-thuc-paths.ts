import { ContentKind, parsePageRef } from '@org/shared-contracts';
import type { EntryKind, PageRef } from '@org/shared-contracts';

export const KIEN_THUC_PATH = '/kien-thuc';

const SHARE_IMAGE_DIRECTORY = '/og/kien-thuc';
const SHARE_IMAGE_EXTENSION = 'jpg';

export enum KienThucPageType {
  Hub = 'hub',
  Lesson = 'bai',
  Star = 'sao',
  Palace = 'cung',
  Term = 'thuat-ngu',
}

export class InvalidPageRefError extends Error {
  constructor(readonly ref: string) {
    super(`Cannot build a kiến thức path from page ref "${ref}"`);
    this.name = 'InvalidPageRefError';
  }
}

export function lessonPath(slug: string): string {
  return `${KIEN_THUC_PATH}/${slug}`;
}

export function entryPath(kind: EntryKind, slug: string): string {
  return `${KIEN_THUC_PATH}/${kind}/${slug}`;
}

export function indexPath(kind: EntryKind): string {
  return `${KIEN_THUC_PATH}/${kind}`;
}

export function refPath(ref: PageRef): string {
  const parsed = parsePageRef(ref);
  if (!parsed) {
    throw new InvalidPageRefError(ref);
  }
  if (parsed.kind === ContentKind.Bai) {
    return lessonPath(parsed.slug);
  }
  return entryPath(parsed.kind, parsed.slug);
}

export function shareImagePath(type: KienThucPageType): string {
  return `${SHARE_IMAGE_DIRECTORY}/${type}.${SHARE_IMAGE_EXTENSION}`;
}
