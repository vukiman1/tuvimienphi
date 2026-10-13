import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import { VanHanEntity } from '../../van-han/entities/van-han.entity';
import { VanHanMissingPart } from '../../van-han/van-han-completeness';
import { toAdminEditor, toAdminYear, toAdminYearSummary } from './admin-van-han.mapper';

const UPDATED_AT = new Date('2026-10-07T03:00:00.000Z');
const PUBLISHED_AT = new Date('2026-10-08T03:00:00.000Z');

function entry(overrides: Partial<VanHanEntity> = {}): VanHanEntity {
  return {
    id: 'entry-ngo',
    year: 2026,
    zodiacOrder: 7,
    zodiac: 'Ngọ',
    title: 'Vận hạn tuổi Ngọ năm Bính Ngọ 2026',
    bornYears: [1966],
    luuNien: 'Năm nay vận trình nhiều chuyển biến.',
    luanGiai: VAN_HAN_ASPECTS.map((aspect) => ({ aspect, rating: 3, body: 'Giữ ổn định.' })),
    tungTuoi: [
      {
        birthYear: 1966,
        canChi: 'Bính Ngọ',
        menh: 'Thiên Hà Thủy',
        male: 'Nam gặp Kế Đô.',
        female: 'Nữ gặp Thái Dương.',
      },
    ],
    sourceUrl: '',
    updatedAt: UPDATED_AT,
    ...overrides,
  } as VanHanEntity;
}

describe('toAdminYear', () => {
  it('lays out all twelve zodiacs in order, written or not', () => {
    const year = toAdminYear({ year: 2026, publishedAt: null, entries: [entry()] });

    expect(year.canChi).toBe('Bính Ngọ');
    expect(year.slots.map((slot) => slot.zodiac)).toEqual([
      'Tý',
      'Sửu',
      'Dần',
      'Mão',
      'Thìn',
      'Tị',
      'Ngọ',
      'Mùi',
      'Thân',
      'Dậu',
      'Tuất',
      'Hợi',
    ]);
  });

  it('marks an unwritten zodiac as missing every part', () => {
    const year = toAdminYear({ year: 2026, publishedAt: null, entries: [entry()] });
    const [ty] = year.slots;

    expect(ty.entry).toBeNull();
    expect(ty.missing).toEqual(Object.values(VanHanMissingPart));
  });

  it('carries the written entry, with nothing left to fill in', () => {
    const year = toAdminYear({ year: 2026, publishedAt: PUBLISHED_AT, entries: [entry()] });
    const ngo = year.slots[6];

    expect(year.publishedAt).toBe('2026-10-08T03:00:00.000Z');
    expect(ngo.missing).toEqual([]);
    expect(ngo.entry?.updatedAt).toBe('2026-10-07T03:00:00.000Z');
    expect(ngo.entry?.tungTuoi[0].menh).toBe('Thiên Hà Thủy');
  });

  it('says which part a half-written entry still needs', () => {
    const year = toAdminYear({
      year: 2026,
      publishedAt: null,
      entries: [entry({ luuNien: '', tungTuoi: [] })],
    });

    expect(year.slots[6].missing).toEqual([
      VanHanMissingPart.LUU_NIEN,
      VanHanMissingPart.TUNG_TUOI,
    ]);
  });
});

describe('toAdminEditor', () => {
  it('opens an empty slot with the birth years to choose from', () => {
    const editor = toAdminEditor({ year: 2027, publishedAt: null, entries: [] }, 7, null);

    expect(editor.slot.entry).toBeNull();
    expect(editor.previousEntry).toBeNull();
    expect(editor.birthYearOptions.map((option) => option.birthYear)).toEqual([
      1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026,
    ]);
    expect(editor.birthYearOptions[3]).toEqual({
      birthYear: 1966,
      canChi: 'Bính Ngọ',
      menh: 'Thiên Hà Thủy',
      age: 62,
    });
  });

  it('offers last year’s entry of the same zodiac to start from', () => {
    const editor = toAdminEditor({ year: 2027, publishedAt: null, entries: [] }, 7, entry());

    expect(editor.previousEntry?.id).toBe('entry-ngo');
  });

  it('opens the entry of the asked zodiac, not a neighbour', () => {
    const mui = entry({ id: 'entry-mui', zodiacOrder: 8, zodiac: 'Mùi' });

    const editor = toAdminEditor(
      { year: 2026, publishedAt: null, entries: [entry(), mui] },
      8,
      null,
    );

    expect(editor.slot.zodiac).toBe('Mùi');
    expect(editor.slot.entry?.id).toBe('entry-mui');
  });
});

describe('toAdminYearSummary', () => {
  it('keeps a draft year apart from a published one', () => {
    expect(toAdminYearSummary({ year: 2027, publishedAt: null, entryCount: 3 })).toEqual({
      year: 2027,
      publishedAt: null,
      entryCount: 3,
    });
    expect(
      toAdminYearSummary({ year: 2026, publishedAt: PUBLISHED_AT, entryCount: 12 }).publishedAt,
    ).toBe('2026-10-08T03:00:00.000Z');
  });
});
