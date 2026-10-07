import type { VanHanCurrent, VanHanEntry } from '@org/shared-contracts';
import { VAN_HAN_FORTUNE_BY_CHI, VAN_HAN_MOCK_YEAR } from './van-han-mock';
import { orderOfChi, resolveVanHanView } from './van-han-view';

function entry(zodiacOrder: number, luuNien: string): VanHanEntry {
  return {
    zodiac: 'Ngọ',
    zodiacOrder,
    year: 2027,
    title: 'Vận hạn tuổi Ngọ năm Đinh Mùi 2027',
    bornYears: [1990],
    luuNien,
    luanGiai: [{ aspect: 'Tài Vận', rating: 4, body: 'Tài lộc hanh thông. Nên tích luỹ.' }],
    tungTuoi: [
      {
        birthYear: 1990,
        canChi: 'Canh Ngọ',
        menh: 'Lộ Bàng Thổ',
        male: 'Nam gặp Thái Dương.',
        female: 'Nữ gặp Thổ Tú.',
      },
    ],
  };
}

const PUBLISHED: VanHanCurrent = {
  year: 2027,
  entries: [entry(7, 'Năm Đinh Mùi nhiều thuận lợi.')],
};

describe('orderOfChi', () => {
  it('numbers the zodiacs from Tý to Hợi', () => {
    expect(orderOfChi('Tý')).toBe(1);
    expect(orderOfChi('Ngọ')).toBe(7);
    expect(orderOfChi('Hợi')).toBe(12);
  });
});

describe('resolveVanHanView', () => {
  it('shows the published reading of the chosen zodiac, under the year it was published for', () => {
    const view = resolveVanHanView(PUBLISHED, 'Ngọ');

    expect(view.year).toBe(2027);
    expect(view.isIllustrative).toBe(false);
    expect(view.fortune.overview).toEqual(['Năm Đinh Mùi nhiều thuận lợi.']);
    expect(view.fortune.aspects[0].points).toEqual(['Tài lộc hanh thông.', 'Nên tích luỹ.']);
  });

  it('falls back to the illustrative reading, and says so, while no year is published', () => {
    const view = resolveVanHanView(null, 'Ngọ');

    expect(view.isIllustrative).toBe(true);
    expect(view.fortune).toBe(VAN_HAN_FORTUNE_BY_CHI['Ngọ']);
    expect(view.year).toBe(VAN_HAN_MOCK_YEAR);
  });

  it('treats a request that failed the same as nothing published', () => {
    expect(resolveVanHanView(undefined, 'Tý').isIllustrative).toBe(true);
  });

  it('flags a zodiac the published year does not cover instead of passing the sample off as real', () => {
    const view = resolveVanHanView(PUBLISHED, 'Mùi');

    expect(view.year).toBe(2027);
    expect(view.isIllustrative).toBe(true);
  });
});
