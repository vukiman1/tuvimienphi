import { xungChieuIndex } from '../chi.js';

export enum ThaiTueRelation {
  Truc = 'trực',
  Xung = 'xung',
  Hinh = 'hình',
  Hai = 'hại',
  Pha = 'phá',
}

type ChiPair = readonly [number, number];

const HINH_GROUPS: readonly (readonly number[])[] = [
  [2, 5, 8],
  [1, 10, 7],
  [0, 3],
];
const TU_HINH_CHI: readonly number[] = [4, 6, 9, 11];
const HAI_PAIRS: readonly ChiPair[] = [
  [0, 7],
  [1, 6],
  [2, 5],
  [3, 4],
  [8, 11],
  [9, 10],
];
const PHA_PAIRS: readonly ChiPair[] = [
  [0, 9],
  [1, 4],
  [2, 11],
  [3, 6],
  [5, 8],
  [7, 10],
];

function isPaired(pairs: readonly ChiPair[], first: number, second: number): boolean {
  return pairs.some(
    ([left, right]) => (left === first && right === second) || (left === second && right === first),
  );
}

function isHinh(first: number, second: number): boolean {
  if (first === second) return TU_HINH_CHI.includes(first);
  return HINH_GROUPS.some((group) => group.includes(first) && group.includes(second));
}

export function phamThaiTue(birthChi: number, viewYearChi: number): readonly ThaiTueRelation[] {
  const relations: readonly (readonly [ThaiTueRelation, boolean])[] = [
    [ThaiTueRelation.Truc, birthChi === viewYearChi],
    [ThaiTueRelation.Xung, xungChieuIndex(birthChi) === viewYearChi],
    [ThaiTueRelation.Hinh, isHinh(birthChi, viewYearChi)],
    [ThaiTueRelation.Hai, isPaired(HAI_PAIRS, birthChi, viewYearChi)],
    [ThaiTueRelation.Pha, isPaired(PHA_PAIRS, birthChi, viewYearChi)],
  ];
  return relations.filter(([, isMatch]) => isMatch).map(([relation]) => relation);
}
