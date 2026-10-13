import { describe, expect, it } from 'vitest';
import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import type { VanHanBirthYearOption, VanHanEntryContent } from '../data/admin-van-han.query';
import {
  DEFAULT_RATING,
  copyOfPreviousYear,
  isSameInput,
  toFormValues,
  toInput,
} from './van-han-form-model';

const NGO = 7;

const OPTIONS: VanHanBirthYearOption[] = [1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026].map(
  (birthYear) => ({
    birthYear,
    canChi: 'Bính Ngọ',
    menh: 'Thiên Hà Thủy',
    age: 2026 - birthYear + 1,
  }),
);

const ENTRY: VanHanEntryContent = {
  id: 'entry-ngo',
  luuNien: 'Năm nay vận trình nhiều chuyển biến.',
  sourceUrl: 'https://example.com/ngo-2026',
  updatedAt: '2026-10-07T03:00:00.000Z',
  luanGiai: [
    { aspect: 'Sức Khoẻ', rating: 2, body: 'Chú ý giấc ngủ.' },
    { aspect: 'Tài Vận', rating: 4, body: 'Dòng tiền ổn.' },
  ],
  tungTuoi: [
    { birthYear: 1966, male: 'Nam gặp Kế Đô.', female: 'Nữ gặp Thái Dương.' },
    { birthYear: 1978, male: 'Nam gặp Kim Diệu.', female: 'Nữ gặp Thái Âm.' },
  ],
};

describe('toFormValues', () => {
  it('opens an unwritten zodiac with four blank aspects and the usual five birth years', () => {
    const values = toFormValues(null, OPTIONS);

    expect(values.luuNien).toBe('');
    expect(values.luanGiai).toEqual(
      VAN_HAN_ASPECTS.map(() => ({ rating: DEFAULT_RATING, body: '' })),
    );
    expect(values.birthYears).toEqual([1966, 1978, 1990, 2002, 2014]);
  });

  it('lines the saved aspects up with the fixed order, leaving the unwritten ones blank', () => {
    const values = toFormValues(ENTRY, OPTIONS);

    expect(values.luanGiai).toEqual([
      { rating: 4, body: 'Dòng tiền ổn.' },
      { rating: 2, body: 'Chú ý giấc ngủ.' },
      { rating: DEFAULT_RATING, body: '' },
      { rating: DEFAULT_RATING, body: '' },
    ]);
  });

  it('keeps the birth years that were saved rather than the default five', () => {
    const values = toFormValues(ENTRY, OPTIONS);

    expect(values.birthYears).toEqual([1966, 1978]);
    expect(values.ages['1978']).toEqual({ male: 'Nam gặp Kim Diệu.', female: 'Nữ gặp Thái Âm.' });
  });
});

describe('toInput', () => {
  it('names every aspect in the order the site shows them', () => {
    const input = toInput(2026, NGO, toFormValues(ENTRY, OPTIONS));

    expect(input.luanGiai.map((aspect) => aspect.aspect)).toEqual([...VAN_HAN_ASPECTS]);
    expect(input.luanGiai[0]).toEqual({ aspect: 'Tài Vận', rating: 4, body: 'Dòng tiền ổn.' });
  });

  it('sends only the birth years still chosen, oldest first', () => {
    const values = toFormValues(ENTRY, OPTIONS);

    const input = toInput(2026, NGO, { ...values, birthYears: [1978] });

    expect(input.tungTuoi).toEqual([
      { birthYear: 1978, male: 'Nam gặp Kim Diệu.', female: 'Nữ gặp Thái Âm.' },
    ]);
  });

  it('sends a chosen birth year with empty readings until they are written', () => {
    const input = toInput(2026, NGO, { ...toFormValues(null, OPTIONS), birthYears: [2002, 1990] });

    expect(input.tungTuoi).toEqual([
      { birthYear: 1990, male: '', female: '' },
      { birthYear: 2002, male: '', female: '' },
    ]);
  });

  it('trims what was typed and leaves the source out when it is blank', () => {
    const values = toFormValues(null, OPTIONS);

    const input = toInput(2026, NGO, { ...values, luuNien: '  Đoạn mở đầu.\n', sourceUrl: '  ' });

    expect(input.luuNien).toBe('Đoạn mở đầu.');
    expect(input.sourceUrl).toBeNull();
  });
});

describe('isSameInput', () => {
  it('sees an entry as unchanged right after it is opened', () => {
    const opened = toFormValues(ENTRY, OPTIONS);

    expect(isSameInput(toInput(2026, NGO, opened), toInput(2026, NGO, { ...opened }))).toBe(true);
  });

  it('notices a single changed rating', () => {
    const opened = toFormValues(ENTRY, OPTIONS);
    const rated = {
      ...opened,
      luanGiai: opened.luanGiai.map((aspect, index) =>
        index === 0 ? { ...aspect, rating: 1 } : aspect,
      ),
    };

    expect(isSameInput(toInput(2026, NGO, opened), toInput(2026, NGO, rated))).toBe(false);
  });
});

describe('copyOfPreviousYear', () => {
  it('brings over the text and ratings but not where last year’s text came from', () => {
    const copied = copyOfPreviousYear(ENTRY, OPTIONS);

    expect(copied.luuNien).toBe('Năm nay vận trình nhiều chuyển biến.');
    expect(copied.luanGiai[0]).toEqual({ rating: 4, body: 'Dòng tiền ổn.' });
    expect(copied.sourceUrl).toBe('');
  });

  it('drops a birth year the new year no longer offers', () => {
    const copied = copyOfPreviousYear(ENTRY, OPTIONS.slice(3));

    expect(copied.birthYears).toEqual([1978]);
  });
});
