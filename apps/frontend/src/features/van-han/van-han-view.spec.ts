import type { VanHanCurrent, VanHanEntry } from '@org/shared-contracts';
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

    expect(view?.year).toBe(2027);
    expect(view?.fortune.overview).toEqual(['Năm Đinh Mùi nhiều thuận lợi.']);
    expect(view?.fortune.aspects[0].points).toEqual(['Tài lộc hanh thông.', 'Nên tích luỹ.']);
  });

  it('has nothing to show while no year is published', () => {
    expect(resolveVanHanView(null, 'Ngọ')).toBeNull();
  });

  it('treats a request that failed the same as nothing published', () => {
    expect(resolveVanHanView(undefined, 'Tý')).toBeNull();
  });

  it('has nothing to show for a zodiac the published year does not cover', () => {
    expect(resolveVanHanView(PUBLISHED, 'Mùi')).toBeNull();
  });
});
