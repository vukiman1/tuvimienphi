import { getPhiTinhBoards } from './phi-tinh';

// Ground truth captured from lichdungsu.com's own phi-tinh functions.
// The site leaves a leading 0 when the center star is 9; that is a display
// bug — the star is 9 — so the 15/1 month board expects 9 where it emits 0.
const ANCHORS: ReadonlyArray<{
  date: Date;
  hour: number;
  nam: number[];
  thang: number[];
  ngay: number[];
  gio: number[];
}> = [
  {
    date: new Date(2026, 7, 11),
    hour: 15,
    nam: [9, 5, 7, 8, 1, 3, 4, 6, 2],
    thang: [2, 7, 9, 1, 3, 5, 6, 8, 4],
    ngay: [2, 6, 4, 3, 1, 8, 7, 5, 9],
    gio: [5, 9, 7, 6, 4, 2, 1, 8, 3],
  },
  {
    date: new Date(2026, 0, 15),
    hour: 0,
    nam: [1, 6, 8, 9, 2, 4, 5, 7, 3],
    thang: [9, 5, 7, 8, 1, 3, 4, 6, 2],
    ngay: [7, 3, 5, 6, 8, 1, 2, 4, 9],
    gio: [3, 8, 1, 2, 4, 6, 7, 9, 5],
  },
  {
    date: new Date(2026, 2, 25),
    hour: 11,
    nam: [9, 5, 7, 8, 1, 3, 4, 6, 2],
    thang: [7, 3, 5, 6, 8, 1, 2, 4, 9],
    ngay: [4, 9, 2, 3, 5, 7, 8, 1, 6],
    gio: [9, 5, 7, 8, 1, 3, 4, 6, 2],
  },
  {
    date: new Date(2025, 11, 22),
    hour: 21,
    nam: [1, 6, 8, 9, 2, 4, 5, 7, 3],
    thang: [1, 6, 8, 9, 2, 4, 5, 7, 3],
    ngay: [1, 6, 8, 9, 2, 4, 5, 7, 3],
    gio: [5, 1, 3, 4, 6, 8, 9, 2, 7],
  },
];

describe('getPhiTinhBoards', () => {
  it.each(ANCHORS)('matches lichdungsu for $date.toISOString', (anchor) => {
    const boards = getPhiTinhBoards(anchor.date, anchor.hour);
    const values = Object.fromEntries(boards.map((b) => [b.label, b.cells.map((c) => c.value)]));

    expect(values['Năm']).toEqual(anchor.nam);
    expect(values['Tháng']).toEqual(anchor.thang);
    expect(values['Ngày']).toEqual(anchor.ngay);
    expect(values['Giờ']).toEqual(anchor.gio);
  });

  it('marks the tứ cát tinh (1, 6, 8, 9) as good', () => {
    const [yearBoard] = getPhiTinhBoards(new Date(2026, 7, 11), 15);
    for (const cell of yearBoard.cells) {
      expect(cell.isGood).toBe([1, 6, 8, 9].includes(cell.value));
    }
  });
});
