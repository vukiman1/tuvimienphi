import { nhiHopIndex, tamHopIndexes, xungChieuIndex } from './chi';

const TY = 0;
const THIN = 4;
const NGO = 6;
const THAN = 8;

describe('tam phương tứ chính', () => {
  it('pairs Thân · Tý · Thìn as one tam hợp group', () => {
    expect(tamHopIndexes(TY)).toEqual([THIN, THAN]);
    expect(tamHopIndexes(THIN)).toEqual([THAN, TY]);
    expect(tamHopIndexes(THAN)).toEqual([TY, THIN]);
  });

  it('faces Tý against Ngọ', () => {
    expect(xungChieuIndex(TY)).toBe(NGO);
    expect(xungChieuIndex(NGO)).toBe(TY);
  });

  it('binds the six nhị hợp couples both ways', () => {
    const couples: ReadonlyArray<readonly [number, number]> = [
      [0, 1], // Tý – Sửu
      [2, 11], // Dần – Hợi
      [3, 10], // Mão – Tuất
      [4, 9], // Thìn – Dậu
      [5, 8], // Tị – Thân
      [6, 7], // Ngọ – Mùi
    ];

    for (const [a, b] of couples) {
      expect(nhiHopIndex(a)).toBe(b);
      expect(nhiHopIndex(b)).toBe(a);
    }
  });
});
