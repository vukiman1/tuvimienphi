import type { AiSchema } from '../../../ai/port/ai.types';

export interface DoanChinh {
  readonly doan1: string;
  readonly doan2: string;
}

export const DOAN_CHINH_SCHEMA: AiSchema = {
  type: 'object',
  properties: {
    doan1: { type: 'string', description: 'Đoạn thuận, đúng hai câu' },
    doan2: { type: 'string', description: 'Đoạn nghịch rồi hoá giải, đúng hai câu' },
  },
  required: ['doan1', 'doan2'],
};

export interface MucParagraph {
  readonly doan: string;
}

export const MUC_SCHEMA: AiSchema = {
  type: 'object',
  properties: { doan: { type: 'string', description: 'Đúng hai câu' } },
  required: ['doan'],
};
