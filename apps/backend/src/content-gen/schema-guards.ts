import type { AiSchema } from '../ai/port/ai.types';
import { SECTION_MAX_PARAGRAPHS, SECTION_MIN_PARAGRAPHS } from './check-text';

export const PARAGRAPHS_SCHEMA: AiSchema = {
  type: 'array',
  items: { type: 'string', description: 'Một đoạn văn' },
  description: `Từ ${SECTION_MIN_PARAGRAPHS} đến ${SECTION_MAX_PARAGRAPHS} đoạn văn`,
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
