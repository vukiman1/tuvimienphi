import { MalformedChapterError } from '../luan-giai.errors';
import type { DoanChinh, MucParagraph } from './chapter-schema';

function parseJsonObject(text: string): object {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new MalformedChapterError(text);
  }
  if (typeof raw !== 'object' || raw === null) {
    throw new MalformedChapterError(text);
  }
  return raw;
}

function hasStringField<K extends string>(value: object, key: K): value is Record<K, string> {
  return typeof Reflect.get(value, key) === 'string';
}

export function parseDoanChinh(text: string): DoanChinh {
  const raw = parseJsonObject(text);
  if (!hasStringField(raw, 'doan1') || !hasStringField(raw, 'doan2')) {
    throw new MalformedChapterError(text);
  }
  return raw;
}

export function parseMuc(text: string): MucParagraph {
  const raw = parseJsonObject(text);
  if (!hasStringField(raw, 'doan')) {
    throw new MalformedChapterError(text);
  }
  return raw;
}
