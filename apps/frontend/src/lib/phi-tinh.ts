import { convertSolarToLunar, getDayPillar, getSolarTerm } from '@/lib/lunar-calendar';

const FLY_STEPS = [5, 2, 1, 2, 2, 1, 2, 5] as const;
const GOOD_STARS: ReadonlySet<number> = new Set([1, 6, 8, 9]);
const STAR_COUNT = 9;
const SEXAGENARY_CYCLE = 60;
const CHI_COUNT = 12;

// Ngũ hoàng/lục bạch order — good (đỏ) stars are the tứ cát tinh 1·6·8·9.
export interface PhiTinhCell {
  readonly value: number;
  readonly isGood: boolean;
}

export interface PhiTinhBoard {
  readonly label: string;
  readonly cells: readonly PhiTinhCell[];
}

const norm = (term: string): string => term.toLowerCase();

const DUONG_THUONG = ['đông chí', 'tiểu hàn', 'đại hàn', 'lập xuân'].map(norm);
const DUONG_TRUNG = ['vũ thủy', 'kinh trập', 'xuân phân', 'thanh minh'].map(norm);
const DUONG_HA = ['cốc vũ', 'lập hạ', 'tiểu mãn', 'mang chủng'].map(norm);
const AM_THUONG = ['hạ chí', 'tiểu thử', 'đại thử', 'lập thu'].map(norm);
const AM_TRUNG = ['xử thử', 'bạch lộ', 'thu phân', 'hàn lộ'].map(norm);
const AM_HA = ['sương giáng', 'lập đông', 'tiểu tuyết', 'đại tuyết'].map(norm);

type Nguyen = 'thuong' | 'trung' | 'ha';
interface DonNguyen {
  readonly isDuong: boolean;
  readonly nguyen: Nguyen;
}

function classifyDonNguyen(term: string): DonNguyen {
  const t = norm(term);
  if (DUONG_THUONG.includes(t)) return { isDuong: true, nguyen: 'thuong' };
  if (DUONG_TRUNG.includes(t)) return { isDuong: true, nguyen: 'trung' };
  if (DUONG_HA.includes(t)) return { isDuong: true, nguyen: 'ha' };
  if (AM_THUONG.includes(t)) return { isDuong: false, nguyen: 'thuong' };
  if (AM_TRUNG.includes(t)) return { isDuong: false, nguyen: 'trung' };
  if (AM_HA.includes(t)) return { isDuong: false, nguyen: 'ha' };
  throw new Error(`Unknown solar term: ${term}`);
}

// Chi tháng suy từ tiết khí.
const CHI_BY_TERM: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Dần', ['lập xuân', 'vũ thủy']],
  ['Mão', ['kinh trập', 'xuân phân']],
  ['Thìn', ['thanh minh', 'cốc vũ']],
  ['Tị', ['lập hạ', 'tiểu mãn']],
  ['Ngọ', ['mang chủng', 'hạ chí']],
  ['Mùi', ['tiểu thử', 'đại thử']],
  ['Thân', ['lập thu', 'xử thử']],
  ['Dậu', ['bạch lộ', 'thu phân']],
  ['Tuất', ['hàn lộ', 'sương giáng']],
  ['Hợi', ['lập đông', 'tiểu tuyết']],
  ['Tý', ['đại tuyết', 'đông chí']],
  ['Sửu', ['tiểu hàn', 'đại hàn']],
];

function monthChiFromTerm(term: string): string {
  const t = norm(term);
  const found = CHI_BY_TERM.find(([, terms]) => terms.includes(t));
  if (!found) throw new Error(`Unknown solar term: ${term}`);
  return found[0];
}

// Bảng trung cung nguyệt tinh: chi tháng → [Tý·Ngọ·Mão·Dậu, Thìn·Tuất·Sửu·Mùi, Dần·Thân·Tị·Hợi].
const MONTH_STAR: Readonly<Record<string, readonly [number, number, number]>> = {
  Dần: [8, 5, 2],
  Mão: [7, 4, 1],
  Thìn: [6, 3, 9],
  Tị: [5, 2, 8],
  Ngọ: [4, 1, 7],
  Mùi: [3, 9, 6],
  Thân: [2, 8, 5],
  Dậu: [1, 7, 4],
  Tuất: [9, 6, 3],
  Hợi: [8, 5, 2],
  Tý: [7, 4, 1],
  Sửu: [6, 3, 9],
};

const YEAR_CHI_GROUP0 = ['Tý', 'Ngọ', 'Mão', 'Dậu'];
const YEAR_CHI_GROUP1 = ['Thìn', 'Tuất', 'Sửu', 'Mùi'];

// Sao khởi nhật tinh: [tuần giáp][dương|âm][thượng, trung, hạ].
const DAY_START: Readonly<Record<string, { duong: readonly number[]; am: readonly number[] }>> = {
  'Giáp Tý': { duong: [1, 7, 4], am: [9, 3, 6] },
  'Giáp Tuất': { duong: [2, 8, 5], am: [8, 2, 5] },
  'Giáp Thân': { duong: [3, 9, 6], am: [7, 1, 4] },
  'Giáp Ngọ': { duong: [4, 1, 7], am: [6, 9, 3] },
  'Giáp Thìn': { duong: [5, 2, 8], am: [5, 8, 2] },
  'Giáp Dần': { duong: [6, 3, 9], am: [4, 7, 1] },
};
const TUAN_GIAP = ['Giáp Tý', 'Giáp Tuất', 'Giáp Thân', 'Giáp Ngọ', 'Giáp Thìn', 'Giáp Dần'];
const NGUYEN_INDEX: Readonly<Record<Nguyen, number>> = { thuong: 0, trung: 1, ha: 2 };
const YEAR_CHI = [
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tị',
  'Ngọ',
  'Mùi',
];

function wrap9(n: number): number {
  const m = n % STAR_COUNT;
  return m === 0 ? STAR_COUNT : m;
}

function applyOffset(star: number, offset: number, isDuong: boolean): number {
  let value = star;
  for (let i = 0; i < offset; i += 1) {
    value = isDuong ? wrap9(value + 1) : wrap9(value - 1 + STAR_COUNT);
  }
  return value;
}

function flyFrom(start: number): number[] {
  const result = [start];
  let current = start;
  for (const step of FLY_STEPS) {
    let next = (current + step) % STAR_COUNT;
    if (next === 0) next = STAR_COUNT;
    result.push(next);
    current = next;
  }
  return result;
}

// Year/month boards start at round((center + 9) % 9); the leading 0 that
// lichdungsu emits when the star is 9 is normalised back to 9 at display.
function boardFromCenter(center: number): number[] {
  return flyFrom(Math.round((center + STAR_COUNT) % STAR_COUNT));
}

// Day/hour boards start one before the center; âm độn reverses the sequence.
function boardThuanNghich(center: number, isDuong: boolean): number[] {
  const start = center - 1 === 0 ? STAR_COUNT : center - 1;
  const forward = flyFrom(start);
  return isDuong ? forward : [...forward].reverse();
}

// Faithful to lichdungsu's totalN: division is NOT floored, so digits leak
// as fractions and the sum converges to a non-integer. The resulting year
// star therefore differs from the mathematically-correct Huyền Không star.
function digitSumSkip9Float(year: number): number {
  let n = year;
  let sum = 0;
  for (let i = 0; i < 320 && n > 0; i += 1) {
    const m = n % 10;
    if (m !== 9) sum += m;
    n /= 10;
  }
  return sum;
}

function tinhVan(year: number): number {
  const soNien = Math.floor((year - 1684) / 60);
  const nam = soNien * 60 + 1684;
  const offset = Math.floor((year - nam) / 20);
  return (soNien % 3) * 3 + 1 + offset;
}

function yearForNienTinh(date: Date, term: string): number {
  const lunarYear = convertSolarToLunar(date).year;
  const solarYear = date.getFullYear();
  const t = norm(term);
  if (t === 'tiểu hàn' || t === 'đại hàn') return solarYear - 1;
  if (t === 'lập xuân' && lunarYear < solarYear) return solarYear;
  return lunarYear;
}

function nienCenter(date: Date, term: string): number {
  const year = yearForNienTinh(date, term);
  const nienPT = 11 - digitSumSkip9Float(year);
  // The 0 / 5 special cases never fire on lichdungsu because nienPT is a float.
  if (nienPT === 0) return STAR_COUNT;
  if (nienPT === 5) return tinhVan(year) % 2 === 0 ? 8 : 2;
  return nienPT;
}

function yearChiForMonth(date: Date, term: string): string {
  const t = norm(term);
  const year = t === 'tiểu hàn' || t === 'đại hàn' ? date.getFullYear() - 1 : date.getFullYear();
  return YEAR_CHI[year % CHI_COUNT];
}

function nguyetCenter(date: Date, term: string): number {
  const monthChi = monthChiFromTerm(term);
  const yearChi = yearChiForMonth(date, term);
  const group = YEAR_CHI_GROUP0.includes(yearChi) ? 0 : YEAR_CHI_GROUP1.includes(yearChi) ? 1 : 2;
  return MONTH_STAR[monthChi][group];
}

function sexagenaryOf(can: number, chi: number): number {
  for (let k = can; k < SEXAGENARY_CYCLE; k += 10) {
    if (k % CHI_COUNT === chi) return k;
  }
  throw new Error(`Invalid can-chi pairing: ${can}, ${chi}`);
}

interface NhatTinh {
  readonly center: number;
  readonly isDuong: boolean;
}

function nhatTinh(date: Date, term: string): NhatTinh {
  const { isDuong, nguyen } = classifyDonNguyen(term);
  const { can, chi } = getDayPillar(date);
  const sexagenary = sexagenaryOf(can, chi);
  const tuanGiap = TUAN_GIAP[Math.floor(sexagenary / 10)];
  const offset = sexagenary % 10;
  const starts = DAY_START[tuanGiap];
  const start = (isDuong ? starts.duong : starts.am)[NGUYEN_INDEX[nguyen]];
  return { center: applyOffset(start, offset, isDuong), isDuong };
}

const HOUR_CHI = [
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
];

function hourChiIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2) % CHI_COUNT;
}

function thoiCenter(dayChi: string, hour: number, isDuong: boolean): number {
  let start: number;
  if (YEAR_CHI_GROUP0.includes(dayChi)) start = isDuong ? 1 : 9;
  else if (YEAR_CHI_GROUP1.includes(dayChi)) start = isDuong ? 4 : 6;
  else start = isDuong ? 7 : 3;
  return applyOffset(start, hourChiIndex(hour), isDuong);
}

function toBoard(label: string, values: readonly number[]): PhiTinhBoard {
  return {
    label,
    cells: values.map((raw) => {
      const value = raw === 0 ? STAR_COUNT : raw;
      return { value, isGood: GOOD_STARS.has(value) };
    }),
  };
}

export function getPhiTinhBoards(date: Date, hour: number): readonly PhiTinhBoard[] {
  const term = getSolarTerm(date);
  const nhat = nhatTinh(date, term);
  const dayChi = HOUR_CHI[getDayPillar(date).chi];

  return [
    toBoard('Năm', boardFromCenter(nienCenter(date, term))),
    toBoard('Tháng', boardFromCenter(nguyetCenter(date, term))),
    toBoard('Ngày', boardThuanNghich(nhat.center, nhat.isDuong)),
    toBoard('Giờ', boardThuanNghich(thoiCenter(dayChi, hour, nhat.isDuong), nhat.isDuong)),
  ];
}
