import type { TuoiNamFacts } from '@org/shared-tu-vi';

export enum TuoiNamSection {
  TongQuan = 'tongQuan',
  SaoHanNam = 'saoHanNam',
  SaoHanNu = 'saoHanNu',
  Menh = 'menh',
  CuoiNha = 'cuoiNha',
  LoiKhuyen = 'loiKhuyen',
}

export interface TuoiNamClaim {
  readonly section: TuoiNamSection;
  readonly keyword: string;
}

export interface TuoiNamBrief {
  readonly facts: TuoiNamFacts;
  readonly claims: readonly TuoiNamClaim[];
}

const NO_KIM_LAU_KEYWORD = 'không phạm Kim lâu';

function kimLauKeyword(facts: TuoiNamFacts): string {
  return facts.kimLau === null ? NO_KIM_LAU_KEYWORD : `Kim lâu ${facts.kimLau}`;
}

export function buildTuoiNamBrief(facts: TuoiNamFacts): TuoiNamBrief {
  const claims: readonly TuoiNamClaim[] = [
    { section: TuoiNamSection.TongQuan, keyword: facts.giaiDoan },
    { section: TuoiNamSection.SaoHanNam, keyword: facts.nam.sao },
    { section: TuoiNamSection.SaoHanNam, keyword: facts.nam.han },
    { section: TuoiNamSection.SaoHanNu, keyword: facts.nu.sao },
    { section: TuoiNamSection.SaoHanNu, keyword: facts.nu.han },
    { section: TuoiNamSection.Menh, keyword: facts.menhVoiNam },
    { section: TuoiNamSection.CuoiNha, keyword: kimLauKeyword(facts) },
    { section: TuoiNamSection.CuoiNha, keyword: facts.hoangOc },
    { section: TuoiNamSection.LoiKhuyen, keyword: facts.giaiDoan },
  ];
  return { facts, claims };
}
