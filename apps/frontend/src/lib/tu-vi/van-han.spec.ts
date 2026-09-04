import { Gender, anAmDuong, anDaiVan } from './van-han';

/** Canh Tuất 1910, Mệnh tại Mùi, Mộc tam cục, Dương Nam — số liệu lấy nguyên từ tuvi.vn. */
const CANH = 6;
const MUI = 7;
const MOC_TAM_CUC = 3;

describe('âm dương nam nữ', () => {
  it('reads the reference chart as Dương Nam going forward', () => {
    expect(anAmDuong(CANH, Gender.Nam)).toEqual({ label: 'Dương Nam', isForward: true });
  });

  it('sends Dương Nam and Âm Nữ forward, the other two backward', () => {
    const AT = 1; // can lẻ → âm
    expect(anAmDuong(CANH, Gender.Nu).isForward).toBe(false);
    expect(anAmDuong(AT, Gender.Nu)).toEqual({ label: 'Âm Nữ', isForward: true });
    expect(anAmDuong(AT, Gender.Nam)).toEqual({ label: 'Âm Nam', isForward: false });
  });
});

describe('an đại vận', () => {
  it('reproduces all twelve spans on the reference chart', () => {
    const expected: ReadonlyArray<readonly [number, number]> = [
      [3, 7], // Mùi — khởi tại cung Mệnh với tuổi bằng số cục
      [13, 8],
      [23, 9],
      [33, 10],
      [43, 11],
      [53, 0],
      [63, 1],
      [73, 2],
      [83, 3],
      [93, 4],
      [103, 5],
      [113, 6],
    ];

    const spans = anDaiVan(MUI, MOC_TAM_CUC, true);

    expect(spans).toHaveLength(12);
    spans.forEach((span, index) => {
      const [startAge, chiIndex] = expected[index];
      expect([span.startAge, span.chiIndex]).toEqual([startAge, chiIndex]);
      expect(span.endAge).toBe(startAge + 9);
    });
  });

  it('walks the palaces backwards for Âm Nam', () => {
    const spans = anDaiVan(MUI, MOC_TAM_CUC, false);
    expect(spans.map((span) => span.chiIndex).slice(0, 4)).toEqual([7, 6, 5, 4]);
  });

  it('covers all twelve palaces exactly once whichever way it runs', () => {
    for (const isForward of [true, false]) {
      const visited = anDaiVan(MUI, MOC_TAM_CUC, isForward).map((span) => span.chiIndex);
      expect(new Set(visited).size).toBe(12);
    }
  });
});
