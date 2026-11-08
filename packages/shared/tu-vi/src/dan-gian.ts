import { mod12 } from './chi.js';
import { CHI } from './lich/lunar-calendar.js';
import { Gender } from './van-han.js';

const CUU_DIEU_CYCLE = 9;
const TAM_HOP_GROUPS = 4;
const KIM_LAU_REMAINDERS: readonly number[] = [1, 3, 6, 8];

export const CUU_DIEU = [
  'La Hầu',
  'Thổ Tú',
  'Thủy Diệu',
  'Thái Bạch',
  'Thái Dương',
  'Vân Hớn',
  'Kế Đô',
  'Thái Âm',
  'Mộc Đức',
] as const;

export type CuuDieu = (typeof CUU_DIEU)[number];

const CUU_DIEU_BY_REMAINDER: Record<Gender, readonly CuuDieu[]> = {
  [Gender.Nam]: [
    'Mộc Đức',
    'La Hầu',
    'Thổ Tú',
    'Thủy Diệu',
    'Thái Bạch',
    'Thái Dương',
    'Vân Hớn',
    'Kế Đô',
    'Thái Âm',
  ],
  [Gender.Nu]: [
    'Thủy Diệu',
    'Kế Đô',
    'Vân Hớn',
    'Mộc Đức',
    'Thái Âm',
    'Thổ Tú',
    'La Hầu',
    'Thái Dương',
    'Thái Bạch',
  ],
};

export const TAM_TAI_YEARS = [1, 2, 3] as const;

export type TamTaiNamThu = (typeof TAM_TAI_YEARS)[number];

export const TAM_TAI_ORDINALS: Readonly<Record<TamTaiNamThu, string>> = {
  1: 'thứ nhất',
  2: 'thứ hai',
  3: 'thứ ba',
};

const TAM_TAI_FIRST_CHI_BY_GROUP: readonly number[] = [2, 11, 8, 5];

function chiNames(chis: readonly number[]): string {
  return chis.map((chi) => CHI[mod12(chi)]).join(', ');
}

function tamTaiGroupLine(firstChi: number, group: number): string {
  const members = [group, group + TAM_HOP_GROUPS, group + 2 * TAM_HOP_GROUPS];
  const years = TAM_TAI_YEARS.map((_, offset) => firstChi + offset);
  return `tuổi ${chiNames(members)} vào các năm ${chiNames(years)}`;
}

export const TAM_TAI_TRUYEN_THONG = `Mỗi bộ ba con giáp tam hợp đi qua Tam tai trong ba năm liền: ${TAM_TAI_FIRST_CHI_BY_GROUP.map(
  tamTaiGroupLine,
).join('; ')}.`;

export function saoChieuMenh(tuoi: number, gender: Gender): CuuDieu {
  return CUU_DIEU_BY_REMAINDER[gender][tuoi % CUU_DIEU_CYCLE];
}

export function isKimLau(tuoi: number): boolean {
  return KIM_LAU_REMAINDERS.includes(tuoi % CUU_DIEU_CYCLE);
}

export function tamTaiNamThu(birthYearChi: number, viewYearChi: number): TamTaiNamThu | null {
  const firstChi = TAM_TAI_FIRST_CHI_BY_GROUP[birthYearChi % TAM_HOP_GROUPS];
  const offset = mod12(viewYearChi - firstChi);
  return offset < TAM_TAI_YEARS.length ? TAM_TAI_YEARS[offset] : null;
}

export function isTamTai(birthYearChi: number, viewYearChi: number): boolean {
  return tamTaiNamThu(birthYearChi, viewYearChi) !== null;
}
