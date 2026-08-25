import {
  CUNG_GRID_POSITIONS,
  centerAnchor,
  nhiHopIndex,
  tamHopIndexes,
  xungChieuIndex,
} from './board-layout';

const TY = 0;
const THIN = 4;
const NGO = 6;
const THAN = 8;

describe('centerAnchor', () => {
  it('anchors a cung to the thiên bàn edge nearest that cung', () => {
    // Toạ độ đối chiếu với ảnh phủ tam hợp của tuvi.vn (`cung-chieu-03.png`, khung 374×500 phủ
    // đúng thiên bàn): đỉnh dưới ≈ 278/374 ngang, đỉnh trái ≈ 122/500 dọc, đỉnh còn lại ở góc trên
    // phải. Neo lệch sang cung đối diện thì tam giác vẽ ra là tam hợp của cung xung chiếu.
    expect(centerAnchor(TY)).toEqual({ x: 2.5, y: 3 });
    expect(centerAnchor(THIN)).toEqual({ x: 1, y: 1.5 });
    expect(centerAnchor(THAN)).toEqual({ x: 3, y: 1 });
    expect(centerAnchor(NGO)).toEqual({ x: 1.5, y: 1 });
  });

  it('keeps every anchor on the border of the thiên bàn', () => {
    for (let index = 0; index < CUNG_GRID_POSITIONS.length; index += 1) {
      const { x, y } = centerAnchor(index);
      expect(x).toBeGreaterThanOrEqual(1);
      expect(x).toBeLessThanOrEqual(3);
      expect(y).toBeGreaterThanOrEqual(1);
      expect(y).toBeLessThanOrEqual(3);
      expect(x === 1 || x === 3 || y === 1 || y === 3).toBe(true);
    }
  });
});

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
