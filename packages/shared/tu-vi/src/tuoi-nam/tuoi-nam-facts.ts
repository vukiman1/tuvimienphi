import { getYearCanChi, getYearPillar } from '../lich/lunar-calendar.js';
import { getNapAm, type NapAm } from '../lich/nap-am.js';
import { saoChieuMenh, tamTaiNamThu, type CuuDieu, type TamTaiNamThu } from '../dan-gian.js';
import { ageInYear, Gender } from '../van-han.js';
import { viewYearPillar } from '../view-year.js';
import { batHan, type BatHan } from './bat-han.js';
import { giaiDoanTuoi, type GiaiDoanTuoi } from './giai-doan-tuoi.js';
import { hoangOc, type HoangOc } from './hoang-oc.js';
import { kimLau, type KimLau } from './kim-lau.js';
import { menhVoiNam, type MenhVoiNam } from './menh-voi-nam.js';
import { phamThaiTue, type ThaiTueRelation } from './thai-tue.js';
import { tuoiXongDat, type XongDat } from './xong-dat.js';

export interface TuoiNamGenderFacts {
  readonly sao: CuuDieu;
  readonly han: BatHan;
}

export interface TuoiNamFacts {
  readonly birthYear: number;
  readonly viewYear: number;
  readonly canChi: string;
  readonly chi: number;
  readonly tuoi: number;
  readonly menh: NapAm;
  readonly menhNam: NapAm;
  readonly menhVoiNam: MenhVoiNam;
  readonly tamTai: TamTaiNamThu | null;
  readonly thaiTue: readonly ThaiTueRelation[];
  readonly kimLau: KimLau | null;
  readonly hoangOc: HoangOc;
  readonly xongDat: XongDat;
  readonly giaiDoan: GiaiDoanTuoi;
  readonly nam: TuoiNamGenderFacts;
  readonly nu: TuoiNamGenderFacts;
}

function genderFacts(tuoi: number, gender: Gender): TuoiNamGenderFacts {
  return { sao: saoChieuMenh(tuoi, gender), han: batHan(tuoi, gender) };
}

export function tuoiNamFacts(birthYear: number, viewYear: number): TuoiNamFacts {
  const birthPillar = getYearPillar(birthYear);
  const viewPillar = viewYearPillar(viewYear);
  const tuoi = ageInYear(birthYear, viewYear);
  const menh = getNapAm(birthPillar);
  const menhNam = getNapAm(viewPillar);

  return {
    birthYear,
    viewYear,
    canChi: getYearCanChi(birthYear),
    chi: birthPillar.chi,
    tuoi,
    menh,
    menhNam,
    menhVoiNam: menhVoiNam(menh.element, menhNam.element),
    tamTai: tamTaiNamThu(birthPillar.chi, viewPillar.chi),
    thaiTue: phamThaiTue(birthPillar.chi, viewPillar.chi),
    kimLau: kimLau(tuoi),
    hoangOc: hoangOc(tuoi),
    xongDat: tuoiXongDat(birthPillar.chi, viewPillar.chi),
    giaiDoan: giaiDoanTuoi(tuoi),
    nam: genderFacts(tuoi, Gender.Nam),
    nu: genderFacts(tuoi, Gender.Nu),
  };
}
