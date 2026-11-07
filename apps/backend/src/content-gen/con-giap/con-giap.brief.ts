import {
  CHI,
  phamThaiTue,
  tamTaiNamThu,
  tuoiXongDat,
  viewYearPillar,
  type XongDat,
} from '@org/shared-tu-vi';
import {
  NO_TAM_TAI_KEYWORD,
  NO_THAI_TUE_KEYWORD,
  tamTaiKeyword,
  thaiTueKeyword,
  type ChiVerdicts,
} from '../chi-verdicts';

export enum ConGiapSection {
  TongQuan = 'tongQuan',
  TamTai = 'tamTai',
  ThaiTue = 'thaiTue',
  XongDat = 'xongDat',
}

export interface ConGiapClaim {
  readonly section: ConGiapSection;
  readonly keyword: string;
}

export interface ConGiapFacts extends ChiVerdicts {
  readonly chi: number;
  readonly viewYear: number;
  readonly viewChi: number;
  readonly xongDat: XongDat;
}

export interface ConGiapBrief {
  readonly facts: ConGiapFacts;
  readonly claims: readonly ConGiapClaim[];
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
