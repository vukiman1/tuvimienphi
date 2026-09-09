import type { AiSchema } from '../../../ai/ai.types';

/** Hai đoạn duy nhất mô hình được viết. Phần còn lại của bài lấy từ bảng khung. */
export interface ThanCuParagraphs {
  readonly doan1: string;
  readonly doan2: string;
}

export const THAN_CU_SCHEMA: AiSchema = {
  type: 'object',
  properties: {
    doan1: { type: 'string', description: 'Đoạn thuận, đúng hai câu' },
    doan2: { type: 'string', description: 'Đoạn nghịch rồi hoá giải, đúng hai câu' },
  },
  required: ['doan1', 'doan2'],
};

/** Một mục con chỉ có một đoạn hai câu. */
export interface MucParagraph {
  readonly doan: string;
}

export const MUC_SCHEMA: AiSchema = {
  type: 'object',
  properties: { doan: { type: 'string', description: 'Đúng hai câu' } },
  required: ['doan'],
};
