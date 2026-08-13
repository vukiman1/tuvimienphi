import {
  convertSolarToLunar,
  getDayCanChi,
  getDayPillar,
  getMonthCanChi,
  getYearCanChi,
} from '@/lib/lunar-calendar';
import { TINH28_ORDER, TU_28, type Tu28 } from '@/lib/tu-28-data';

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const TU_COUNT = 28;
const CHI_COUNT = 12;
const YEAR_TU_EPOCH = 1684;
const YEAR_TU_OFFSET = 18;

// nhithapbattu_sao order (Giốc..Nữ) — index into TU_28.
const SAO_ORDER = TU_28.map((tu) => tu.name);

function jdn(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function yearTuIndex(lunarYear: number): number {
  return (YEAR_TU_OFFSET + ((lunarYear - YEAR_TU_EPOCH) % TU_COUNT)) % TU_COUNT;
}

function monthTuIndex(lunarMonth: number, yearIndex: number): number {
  return (yearIndex + (lunarMonth - 1)) % TU_COUNT;
}

function dayTuIndex(date: Date): number {
  const name = TINH28_ORDER[(jdn(date) + 1) % TU_COUNT];
  return SAO_ORDER.indexOf(name);
}

function hourTuIndex(dayIndex: number, hourChiIndex: number): number {
  return (dayIndex + hourChiIndex) % TU_COUNT;
}

function hourChiIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2) % CHI_COUNT;
}

export interface NhiThapBatTuPillar {
  readonly label: string;
  readonly value: string;
  readonly canChi: string;
  readonly tu: Tu28;
}

export interface NhiThapBatTuResult {
  readonly pillars: readonly NhiThapBatTuPillar[];
  readonly verses: readonly { readonly tu: Tu28; readonly subtitle: string }[];
}

const LUNAR_MONTH_NAMES = [
  '',
  'Giêng',
  'Hai',
  'Ba',
  'Bốn',
  'Năm',
  'Sáu',
  'Bảy',
  'Tám',
  'Chín',
  'Mười',
  'Mười Một',
  'Chạp',
];

function formatHour(hour: number): string {
  return `${`${hour}`.padStart(2, '0')}:00`;
}

function hourCanChi(date: Date, hour: number): string {
  const chi = hourChiIndex(hour);
  const tyCan = (getDayPillar(date).can % 5) * 2;
  return `${CAN[(tyCan + chi) % 10]} ${CHI[chi]}`;
}

export function getNhiThapBatTu(date: Date, hour: number): NhiThapBatTuResult {
  const lunar = convertSolarToLunar(date);
  const yearIndex = yearTuIndex(lunar.year);
  const monthIndex = monthTuIndex(lunar.month, yearIndex);
  const dayIndex = dayTuIndex(date);
  const hourIndex = hourTuIndex(dayIndex, hourChiIndex(hour));

  const yearCanChi = getYearCanChi(lunar.year);
  const monthCanChi = getMonthCanChi(lunar);
  const dayCanChi = getDayCanChi(date);

  const pillars: readonly NhiThapBatTuPillar[] = [
    { label: 'Năm', value: `${lunar.year}`, canChi: yearCanChi, tu: TU_28[yearIndex] },
    {
      label: 'Tháng',
      value: LUNAR_MONTH_NAMES[lunar.month] ?? `${lunar.month}`,
      canChi: monthCanChi,
      tu: TU_28[monthIndex],
    },
    { label: 'Ngày', value: `${lunar.day}`, canChi: dayCanChi, tu: TU_28[dayIndex] },
    {
      label: 'Giờ',
      value: formatHour(hour),
      canChi: hourCanChi(date, hour),
      tu: TU_28[hourIndex],
    },
  ];

  const verses = pillars.map((pillar) => ({
    tu: pillar.tu,
    subtitle: `${pillar.label} ${pillar.value} - ${pillar.canChi}`,
  }));

  return { pillars, verses };
}
