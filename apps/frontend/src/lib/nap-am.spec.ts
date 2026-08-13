import { getYearPillar } from './lunar-calendar';
import { getNapAm } from './nap-am';

describe('getNapAm', () => {
  it('resolves the nạp âm of the Ngọ birth years', () => {
    const cases: ReadonlyArray<[number, string, string]> = [
      [1966, 'Thiên Hà Thủy', 'Thủy'],
      [1978, 'Thiên Thượng Hỏa', 'Hỏa'],
      [1990, 'Lộ Bàng Thổ', 'Thổ'],
      [2002, 'Dương Liễu Mộc', 'Mộc'],
      [2014, 'Sa Trung Kim', 'Kim'],
      [2026, 'Thiên Hà Thủy', 'Thủy'],
    ];

    for (const [year, name, element] of cases) {
      expect(getNapAm(getYearPillar(year))).toEqual({ name, element });
    }
  });

  it('resolves the classic Giáp Tý and Giáp Tuất pillars', () => {
    expect(getNapAm({ can: 0, chi: 0 })).toEqual({ name: 'Hải Trung Kim', element: 'Kim' });
    expect(getNapAm({ can: 0, chi: 10 })).toEqual({ name: 'Sơn Đầu Hỏa', element: 'Hỏa' });
  });
});
