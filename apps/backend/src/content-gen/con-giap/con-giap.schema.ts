import type { ConGiapArticle } from '@org/shared-contracts';
import type { AiSchema } from '../../ai/port/ai.types';

export type ConGiapDraft = Omit<
  ConGiapArticle,
  'slug' | 'chi' | 'viewYear' | 'model' | 'generatedAt'
>;

export class MalformedConGiapDraftError extends Error {
  constructor(readonly raw: string) {
    super('model returned something that is not the expected Tết con giáp object');
    this.name = 'MalformedConGiapDraftError';
  }
}

const SECTION_KEYS = ['tongQuan', 'tamTai', 'thaiTue', 'xongDat'] as const;

const PARAGRAPHS_SCHEMA: AiSchema = {
  type: 'array',
  items: { type: 'string', description: 'Một đoạn văn' },
  description: 'Từ 2 đến 4 đoạn văn',
};

export const CON_GIAP_SCHEMA: AiSchema = {
  type: 'object',
  properties: {
    tongQuan: PARAGRAPHS_SCHEMA,
    tamTai: PARAGRAPHS_SCHEMA,
    thaiTue: PARAGRAPHS_SCHEMA,
    xongDat: PARAGRAPHS_SCHEMA,
  },
  required: [...SECTION_KEYS],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isConGiapDraft(value: unknown): value is ConGiapDraft {
  return isRecord(value) && SECTION_KEYS.every((key) => isStringArray(value[key]));
}

export function parseConGiapDraft(text: string): ConGiapDraft {
  const parsed: unknown = JSON.parse(text);
  if (!isConGiapDraft(parsed)) throw new MalformedConGiapDraftError(text);
  return parsed;
}
