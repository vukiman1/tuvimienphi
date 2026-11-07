import type { TuoiNamArticle } from '@org/shared-contracts';
import type { AiSchema } from '../../ai/port/ai.types';

export type TuoiNamDraft = Omit<
  TuoiNamArticle,
  'slug' | 'birthYear' | 'viewYear' | 'model' | 'generatedAt'
>;

export class MalformedTuoiNamDraftError extends Error {
  constructor(readonly raw: string) {
    super('model returned something that is not the expected Tết year-page object');
    this.name = 'MalformedTuoiNamDraftError';
  }
}

const SECTION_KEYS = ['tongQuan', 'saoHanNam', 'saoHanNu', 'menh', 'cuoiNha', 'loiKhuyen'] as const;

const PARAGRAPHS_SCHEMA: AiSchema = {
  type: 'array',
  items: { type: 'string', description: 'Một đoạn văn' },
  description: 'Từ 2 đến 4 đoạn văn',
};

export const TUOI_NAM_SCHEMA: AiSchema = {
  type: 'object',
  properties: {
    tongQuan: PARAGRAPHS_SCHEMA,
    saoHanNam: PARAGRAPHS_SCHEMA,
    saoHanNu: PARAGRAPHS_SCHEMA,
    menh: PARAGRAPHS_SCHEMA,
    cuoiNha: PARAGRAPHS_SCHEMA,
    loiKhuyen: PARAGRAPHS_SCHEMA,
    faq: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
      },
      description: 'Từ 3 đến 5 câu hỏi',
    },
  },
  required: [...SECTION_KEYS, 'faq'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isFaqEntry(value: unknown): value is TuoiNamDraft['faq'][number] {
  return isRecord(value) && typeof value.question === 'string' && typeof value.answer === 'string';
}

function isTuoiNamDraft(value: unknown): value is TuoiNamDraft {
  return (
    isRecord(value) &&
    SECTION_KEYS.every((key) => isStringArray(value[key])) &&
    Array.isArray(value.faq) &&
    value.faq.every(isFaqEntry)
  );
}

export function parseTuoiNamDraft(text: string): TuoiNamDraft {
  const parsed: unknown = JSON.parse(text);
  if (!isTuoiNamDraft(parsed)) throw new MalformedTuoiNamDraftError(text);
  return parsed;
}
