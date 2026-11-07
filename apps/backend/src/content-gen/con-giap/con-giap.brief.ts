import {
  CHI,
  phamThaiTue,
  tamTaiNamThu,
  tuoiXongDat,
  viewYearPillar,
  type ThaiTueRelation,
  type XongDat,
} from '@org/shared-tu-vi';

export enum ConGiapSection {
  TongQuan = 'tongQuan',
  TamTai = 'tamTai',
  ThaiTue = 'thaiTue',
  XongDat = 'xongDat',
}

export type TamTaiYear = 1 | 2 | 3;

export interface ConGiapClaim {
  readonly section: ConGiapSection;
  readonly keyword: string;
}

export interface ConGiapFacts {
  readonly chi: number;
  readonly viewYear: number;
  readonly viewChi: number;
  readonly tamTai: TamTaiYear | null;
  readonly thaiTue: readonly ThaiTueRelation[];
  readonly xongDat: XongDat;
}

export interface ConGiapBrief {
  readonly facts: ConGiapFacts;
  readonly claims: readonly ConGiapClaim[];
}

export const NO_TAM_TAI_KEYWORD = 'không phạm Tam tai';
export const NO_THAI_TUE_KEYWORD = 'không phạm Thái tuế';
export const THAI_TUE_SUFFIX = 'Thái tuế';

const TAM_TAI_YEAR_WORDS = { 1: 'nhất', 2: 'hai', 3: 'ba' } as const;

export function tamTaiKeyword(year: TamTaiYear): string {
  return `năm thứ ${TAM_TAI_YEAR_WORDS[year]} của Tam tai`;
}

export function thaiTueKeyword(relation: ThaiTueRelation): string {
  return `${relation} ${THAI_TUE_SUFFIX}`;
}

export function conGiapFacts(chi: number, viewYear: number): ConGiapFacts {
  const viewChi = viewYearPillar(viewYear).chi;
  return {
    chi,
    viewYear,
    viewChi,
    tamTai: tamTaiNamThu(chi, viewChi),
    thaiTue: phamThaiTue(chi, viewChi),
    xongDat: tuoiXongDat(chi, viewChi),
  };
}

function tamTaiClaim(facts: ConGiapFacts): ConGiapClaim {
  return {
    section: ConGiapSection.TamTai,
    keyword: facts.tamTai === null ? NO_TAM_TAI_KEYWORD : tamTaiKeyword(facts.tamTai),
  };
}

function thaiTueClaims(facts: ConGiapFacts): readonly ConGiapClaim[] {
  const keywords =
    facts.thaiTue.length === 0 ? [NO_THAI_TUE_KEYWORD] : facts.thaiTue.map(thaiTueKeyword);
  return keywords.map((keyword) => ({ section: ConGiapSection.ThaiTue, keyword }));
}

function xongDatClaims(facts: ConGiapFacts): readonly ConGiapClaim[] {
  return [...facts.xongDat.hop, ...facts.xongDat.tranh].map((chi) => ({
    section: ConGiapSection.XongDat,
    keyword: CHI[chi],
  }));
}

export function buildConGiapBrief(facts: ConGiapFacts): ConGiapBrief {
  return {
    facts,
    claims: [
      { section: ConGiapSection.TongQuan, keyword: CHI[facts.chi] },
      tamTaiClaim(facts),
      ...thaiTueClaims(facts),
      ...xongDatClaims(facts),
    ],
  };
}
