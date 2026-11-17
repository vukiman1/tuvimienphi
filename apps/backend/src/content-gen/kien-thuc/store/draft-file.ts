import type { ContentSection } from '@org/shared-contracts';
import { isRecord, isStringArray } from '../../schema-guards';
import type { PageDraftBody } from '../validate/check-shape';

export const DRAFT_AUTHOR = 'claude-code';

export interface DraftMetadata {
  readonly writtenBy: typeof DRAFT_AUTHOR;
  readonly writtenAt: string;
}

export type DraftFile = PageDraftBody & DraftMetadata;

const ALLOWED_KEYS: readonly string[] = ['summary', 'sections', 'writtenBy', 'writtenAt'];

function isSection(value: unknown): value is ContentSection {
  return isRecord(value) && typeof value.heading === 'string' && isStringArray(value.paragraphs);
}

export function isSections(value: unknown): value is readonly ContentSection[] {
  return Array.isArray(value) && value.every(isSection);
}

export function isDraftFile(value: unknown): value is DraftFile {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== ALLOWED_KEYS.length || !keys.every((key) => ALLOWED_KEYS.includes(key))) {
    return false;
  }
  return (
    typeof value.summary === 'string' &&
    isSections(value.sections) &&
    value.writtenBy === DRAFT_AUTHOR &&
    typeof value.writtenAt === 'string'
  );
}

export function offendingDraftKey(value: Record<string, unknown>): string {
  const extra = Object.keys(value).find((key) => !ALLOWED_KEYS.includes(key));
  if (extra !== undefined) return extra;
  if (typeof value.summary !== 'string') return 'summary';
  if (!isSections(value.sections)) return 'sections';
  if (value.writtenBy !== DRAFT_AUTHOR) return 'writtenBy';
  if (typeof value.writtenAt !== 'string') return 'writtenAt';
  return 'unknown';
}
