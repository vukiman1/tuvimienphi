import type { AiSchema } from './ai.types';
import { closedSchema } from './closed-schema';

const CHAPTER: AiSchema = {
  type: 'object',
  properties: {
    doan1: { type: 'string', description: 'Đoạn thuận' },
    muc: {
      type: 'array',
      items: { type: 'object', properties: { doan: { type: 'string' } }, required: ['doan'] },
    },
  },
  required: ['doan1', 'muc'],
};

describe('closedSchema', () => {
  it('forbids extra properties on every object, which strict output modes insist on', () => {
    const closed = closedSchema(CHAPTER) as {
      additionalProperties: boolean;
      properties: { muc: { items: { additionalProperties: boolean } } };
    };

    expect(closed.additionalProperties).toBe(false);
    expect(closed.properties.muc.items.additionalProperties).toBe(false);
  });

  it('keeps the shape, the required list and the descriptions', () => {
    expect(closedSchema(CHAPTER)).toEqual({
      type: 'object',
      properties: {
        doan1: { type: 'string', description: 'Đoạn thuận' },
        muc: {
          type: 'array',
          items: {
            type: 'object',
            properties: { doan: { type: 'string' } },
            required: ['doan'],
            additionalProperties: false,
          },
        },
      },
      required: ['doan1', 'muc'],
      additionalProperties: false,
    });
  });

  it('leaves the schema it was given untouched', () => {
    const before = JSON.stringify(CHAPTER);

    closedSchema(CHAPTER);

    expect(JSON.stringify(CHAPTER)).toBe(before);
  });
});
