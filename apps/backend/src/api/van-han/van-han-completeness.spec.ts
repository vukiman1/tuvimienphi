import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import {
  VanHanMissingPart,
  isComplete,
  missingParts,
  type VanHanContent,
} from './van-han-completeness';

const COMPLETE: VanHanContent = {
  luuNien: 'Năm nay vận trình nhiều chuyển biến.',
  luanGiai: VAN_HAN_ASPECTS.map((aspect) => ({ aspect, rating: 3, body: 'Giữ ổn định.' })),
  tungTuoi: [{ male: 'Nam gặp Kế Đô.', female: 'Nữ gặp Thái Dương.' }],
};

describe('missingParts', () => {
  it('finds nothing missing once every part is written', () => {
    expect(missingParts(COMPLETE)).toEqual([]);
    expect(isComplete(COMPLETE)).toBe(true);
  });

  it('reports every part for a zodiac nobody has written yet', () => {
    expect(missingParts(null)).toEqual([
      VanHanMissingPart.LUU_NIEN,
      VanHanMissingPart.LUAN_GIAI,
      VanHanMissingPart.TUNG_TUOI,
    ]);
  });

  it('treats an overview of only spaces as not written', () => {
    expect(missingParts({ ...COMPLETE, luuNien: '  \n ' })).toEqual([VanHanMissingPart.LUU_NIEN]);
  });

  it('wants all four aspects, not just some of them', () => {
    const withoutLast = { ...COMPLETE, luanGiai: COMPLETE.luanGiai.slice(0, 3) };

    expect(missingParts(withoutLast)).toEqual([VanHanMissingPart.LUAN_GIAI]);
  });

  it('does not count an aspect that only has a rating', () => {
    const rated = COMPLETE.luanGiai.map((aspect, index) =>
      index === 0 ? { ...aspect, body: '' } : aspect,
    );

    expect(missingParts({ ...COMPLETE, luanGiai: rated })).toEqual([VanHanMissingPart.LUAN_GIAI]);
  });

  it('wants at least one birth year', () => {
    expect(missingParts({ ...COMPLETE, tungTuoi: [] })).toEqual([VanHanMissingPart.TUNG_TUOI]);
  });

  it('wants both the male and the female reading of every birth year', () => {
    const halfWritten = { ...COMPLETE, tungTuoi: [{ male: 'Nam gặp Kế Đô.', female: '' }] };

    expect(missingParts(halfWritten)).toEqual([VanHanMissingPart.TUNG_TUOI]);
  });
});
