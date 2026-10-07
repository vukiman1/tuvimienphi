import { describe, expect, it } from 'vitest';
import type { VanHanYearSummary } from '../data/admin-van-han.query';
import {
  completeCount,
  defaultYear,
  isZodiacOrder,
  missingLabel,
  parseYearParam,
  slotStatus,
  yearChoiceLabel,
  yearChoices,
} from './van-han-year-model';

const PUBLISHED: VanHanYearSummary = {
  year: 2026,
  publishedAt: '2026-10-07T03:00:00.000Z',
  entryCount: 12,
};
const DRAFT: VanHanYearSummary = { year: 2027, publishedAt: null, entryCount: 3 };

const ENTRY = { id: 'entry', updatedAt: '2026-10-07T03:00:00.000Z' };

describe('defaultYear', () => {
  it('opens the newest year that has content, where the work in progress is', () => {
    expect(defaultYear([PUBLISHED, DRAFT], 2026)).toBe(2027);
  });

  it('opens this year when nothing has been written yet', () => {
    expect(defaultYear([], 2026)).toBe(2026);
  });
});

describe('yearChoices', () => {
  it('always offers this year and the next, so a new year can be started', () => {
    expect(yearChoices([], 2026, 2026)).toEqual([2027, 2026]);
  });

  it('keeps an older year with content, and the one being looked at, in the list', () => {
    const older: VanHanYearSummary = { year: 2024, publishedAt: null, entryCount: 12 };

    expect(yearChoices([PUBLISHED, older], 2030, 2026)).toEqual([2030, 2027, 2026, 2024]);
  });
});

describe('yearChoiceLabel', () => {
  it('tells a published year, a draft and an empty year apart', () => {
    expect(yearChoiceLabel(2026, [PUBLISHED, DRAFT])).toBe('2026 · đã xuất bản');
    expect(yearChoiceLabel(2027, [PUBLISHED, DRAFT])).toBe('2027 · bản nháp 3/12');
    expect(yearChoiceLabel(2028, [PUBLISHED, DRAFT])).toBe('2028 · chưa có nội dung');
  });
});

describe('slotStatus', () => {
  it('separates unwritten, half written and finished zodiacs', () => {
    expect(slotStatus({ entry: null, missing: ['LUU_NIEN', 'LUAN_GIAI', 'TUNG_TUOI'] })).toBe(
      'EMPTY',
    );
    expect(slotStatus({ entry: ENTRY, missing: ['TUNG_TUOI'] })).toBe('INCOMPLETE');
    expect(slotStatus({ entry: ENTRY, missing: [] })).toBe('COMPLETE');
  });

  it('counts only the finished ones towards publishing', () => {
    const slots = [
      { entry: ENTRY, missing: [] },
      { entry: ENTRY, missing: ['LUAN_GIAI' as const] },
      { entry: null, missing: [] },
    ];

    expect(completeCount(slots)).toBe(1);
  });

  it('names the missing parts in words', () => {
    expect(missingLabel(['LUU_NIEN', 'TUNG_TUOI'])).toBe('lưu niên, từng tuổi');
  });
});

describe('parseYearParam', () => {
  it('reads a year whether the address carries it as a number or as text', () => {
    expect(parseYearParam(2027)).toBe(2027);
    expect(parseYearParam('2027')).toBe(2027);
  });

  it('ignores anything that is not a year the calendar supports', () => {
    expect(parseYearParam('next')).toBeUndefined();
    expect(parseYearParam(1800)).toBeUndefined();
    expect(parseYearParam(2026.5)).toBeUndefined();
    expect(parseYearParam(undefined)).toBeUndefined();
  });
});

describe('isZodiacOrder', () => {
  it('accepts one to twelve and nothing else', () => {
    expect(isZodiacOrder(1)).toBe(true);
    expect(isZodiacOrder(12)).toBe(true);
    expect(isZodiacOrder(0)).toBe(false);
    expect(isZodiacOrder(13)).toBe(false);
    expect(isZodiacOrder(Number.NaN)).toBe(false);
  });
});
