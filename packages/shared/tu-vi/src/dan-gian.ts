import { mod12 } from './chi.js';
import { Gender } from './van-han.js';

const CUU_DIEU_CYCLE = 9;
const TAM_TAI_SPAN = 3;
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

const TAM_TAI_FIRST_CHI_BY_GROUP: readonly number[] = [2, 11, 8, 5];

export function saoChieuMenh(tuoi: number, gender: Gender): CuuDieu {
  return CUU_DIEU_BY_REMAINDER[gender][tuoi % CUU_DIEU_CYCLE];
}

export function isKimLau(tuoi: number): boolean {
  return KIM_LAU_REMAINDERS.includes(tuoi % CUU_DIEU_CYCLE);
}

export function isTamTai(birthYearChi: number, viewYearChi: number): boolean {
  const firstChi = TAM_TAI_FIRST_CHI_BY_GROUP[birthYearChi % TAM_HOP_GROUPS];
  return mod12(viewYearChi - firstChi) < TAM_TAI_SPAN;
}
