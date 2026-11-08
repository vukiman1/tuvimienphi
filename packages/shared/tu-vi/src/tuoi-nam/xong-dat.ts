import { CHI_COUNT, nhiHopIndex, tamHopIndexes } from '../chi.js';
import { phamThaiTue, ThaiTueRelation } from './thai-tue.js';

export interface XongDat {
  readonly hop: readonly number[];
  readonly tranh: readonly number[];
}

const CLASHING_RELATIONS: readonly ThaiTueRelation[] = [
  ThaiTueRelation.Xung,
  ThaiTueRelation.Hinh,
  ThaiTueRelation.Hai,
];
const ALL_CHI: readonly number[] = Array.from({ length: CHI_COUNT }, (_, chi) => chi);

const CLASHING_NAMES = CLASHING_RELATIONS.slice(0, -1).join(', ');
const LAST_CLASHING_NAME = CLASHING_RELATIONS[CLASHING_RELATIONS.length - 1];

export const XONG_DAT_TRUYEN_THONG = `Người hợp xông đất có tuổi tam hợp hoặc lục hợp với tuổi chủ nhà; những tuổi ${CLASHING_NAMES} hoặc ${LAST_CLASHING_NAME} với tuổi chủ nhà hay với chi của năm mới thì nên tránh.`;

function chiClashingWith(targetChi: number): readonly number[] {
  return ALL_CHI.filter((chi) =>
    phamThaiTue(chi, targetChi).some((relation) => CLASHING_RELATIONS.includes(relation)),
  );
}

function ascending(first: number, second: number): number {
  return first - second;
}

export function tuoiXongDat(houseChi: number, viewYearChi: number): XongDat {
  const tranh = [...new Set([...chiClashingWith(houseChi), ...chiClashingWith(viewYearChi)])].sort(
    ascending,
  );
  const hop = [...tamHopIndexes(houseChi), nhiHopIndex(houseChi)]
    .filter((chi) => !tranh.includes(chi))
    .sort(ascending);
  return { hop, tranh };
}
