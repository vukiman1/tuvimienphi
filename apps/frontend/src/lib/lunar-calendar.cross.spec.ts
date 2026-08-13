import { convertSolarToLunar, getDayCanChi, getSolarTerm } from './lunar-calendar';

// Ground truth captured directly from lichdungsu.com's own amlich / can-chi /
// tiết-khí functions, to confirm our base conversions agree with theirs.
interface Anchor {
  readonly date: [number, number, number]; // d, m, y
  readonly lDay: number;
  readonly lMonth: number;
  readonly lYear: number;
  readonly leap?: boolean;
  readonly canChiDay: string;
  readonly term: string;
}

const ANCHORS: readonly Anchor[] = [
  { date: [1, 1, 2026], lDay: 13, lMonth: 11, lYear: 2025, canChiDay: 'Ất Hợi', term: 'Đông chí' },
  { date: [11, 8, 2026], lDay: 29, lMonth: 6, lYear: 2026, canChiDay: 'Đinh Tị', term: 'Lập thu' },
  {
    date: [17, 2, 2026],
    lDay: 1,
    lMonth: 1,
    lYear: 2026,
    canChiDay: 'Nhâm Tuất',
    term: 'Lập xuân',
  },
  {
    date: [16, 2, 2026],
    lDay: 29,
    lMonth: 12,
    lYear: 2025,
    canChiDay: 'Tân Dậu',
    term: 'Lập xuân',
  },
  { date: [25, 3, 2025], lDay: 26, lMonth: 2, lYear: 2025, canChiDay: 'Quý Tị', term: 'Xuân phân' },
  { date: [6, 4, 2023], lDay: 16, lMonth: 2, lYear: 2023, leap: true, canChiDay: 'Giáp Ngọ', term: 'Thanh minh' }, // prettier-ignore
  { date: [20, 4, 2023], lDay: 1, lMonth: 3, lYear: 2023, canChiDay: 'Mậu Thân', term: 'Cốc vũ' },
  { date: [31, 12, 2024], lDay: 1, lMonth: 12, lYear: 2024, canChiDay: 'Kỷ Tị', term: 'Đông chí' },
  { date: [29, 1, 2025], lDay: 1, lMonth: 1, lYear: 2025, canChiDay: 'Mậu Tuất', term: 'Đại hàn' },
  {
    date: [15, 7, 2024],
    lDay: 10,
    lMonth: 6,
    lYear: 2024,
    canChiDay: 'Canh Thìn',
    term: 'Tiểu thử',
  },
  {
    date: [10, 10, 2027],
    lDay: 11,
    lMonth: 9,
    lYear: 2027,
    canChiDay: 'Nhâm Tuất',
    term: 'Hàn lộ',
  },
  { date: [3, 2, 2027], lDay: 27, lMonth: 12, lYear: 2026, canChiDay: 'Quý Sửu', term: 'Đại hàn' },
];

describe('base conversions agree with lichdungsu', () => {
  it.each(ANCHORS)('$date', (anchor) => {
    const [d, m, y] = anchor.date;
    const date = new Date(y, m - 1, d);
    const lunar = convertSolarToLunar(date);

    expect(lunar.day).toBe(anchor.lDay);
    expect(lunar.month).toBe(anchor.lMonth);
    expect(lunar.year).toBe(anchor.lYear);
    expect(lunar.isLeapMonth).toBe(anchor.leap ?? false);
    expect(getDayCanChi(date)).toBe(anchor.canChiDay);
    expect(getSolarTerm(date).toLowerCase()).toBe(anchor.term.toLowerCase());
  });
});
