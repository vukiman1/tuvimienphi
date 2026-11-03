import { anLuuTinh } from '../an-luu-tinh.js';
import { anTuHoaDaiVan } from '../an-luu-dai-van.js';
import { starPlacesOf, type NatalChart } from '../cast-chart.js';
import { canOfCung, cungNameAt, type CungName } from '../dia-ban.js';
import { CAN, CHI } from '../lich/lunar-calendar.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { PhuTinhName } from '../sao-names.js';
import { anTieuHan } from '../tieu-han.js';
import type { TuHoa } from '../tu-hoa.js';
import { ageInYear, daiVanAt, type DaiVan } from '../van-han.js';
import { anTuHoaLuuNien, viewYearPillar } from '../view-year.js';
import { DAI_VAN_CHU_DE } from './bang/van-han/dai-van-chu-de.js';
import { HOA_VAN_HAN_LUAN } from './bang/van-han/hoa-van-han-luan.js';
import { LUU_TINH_LUAN } from './bang/van-han/luu-tinh-luan.js';
import { THE_FACTOR, buildMenhLensBrief } from './build-menh-brief.js';
import type { ChapterBrief, MucExtras, SaoTrongBai } from './chapter-brief.js';
import { Sac, type LuanDe } from './luan-de.js';
import { theCuaChi, tuHoaTacDongTai } from './the-cung.js';

const MIN_MUC_CLAIMS = 2;
const MAX_MUC_CLAIMS = 3;

const LUU_TINH_CLAIM_BY_NAME: Readonly<Partial<Record<PhuTinhName, LuanDe>>> = LUU_TINH_LUAN;

export enum VanHanTone {
  LookBack = 'nhin-lai',
  Advice = 'khuyen',
}

export enum VanHanMucKey {
  DiemSang = 'diem-sang',
  DieuCanGiu = 'dieu-can-giu',
  LinhVuc = 'linh-vuc',
  VanKeTiep = 'van-ke-tiep',
  DanGian = 'dan-gian',
}

export interface VanHanYear {
  readonly viewYear: number;
  readonly namCanChi: string;
  readonly tuoi: number;
  readonly tone: VanHanTone;
  readonly daiVan: DaiVan;
  readonly cungDaiVan: CungName;
  readonly namThuTrongVan: number;
  readonly tieuHan: number;
  readonly cungTieuHan: CungName;
  readonly daiVanKeTiep: DaiVan | null;
  readonly cungDaiVanKeTiep: CungName | null;
  readonly namBatDauVanKeTiep: number | null;
}

export interface VanHanBriefFacts {
  readonly namXem: number;
  readonly namCanChi: string;
  readonly tuoi: number;
  readonly tone: VanHanTone;
  readonly daiVanTuoi: string;
  readonly namThuTrongVan: number;
  readonly cungDaiVan: CungName;
  readonly cungTieuHan: CungName;
  readonly chuDeVan: string;
}

export interface VanHanBrief extends ChapterBrief {
  readonly vanHan: VanHanBriefFacts;
}

export interface VanHanMucBrief extends VanHanBrief, MucExtras<VanHanMucKey> {}

interface PlacedClaim {
  readonly claim: LuanDe;
  readonly star: SaoTrongBai | null;
}

interface YearMuc {
  readonly muc: VanHanMucKey;
  readonly tieuDe: string;
  readonly sac: Sac;
}

const YEAR_MUCS: readonly YearMuc[] = [
  { muc: VanHanMucKey.DiemSang, tieuDe: 'Điểm sáng trong năm', sac: Sac.Thuan },
  { muc: VanHanMucKey.DieuCanGiu, tieuDe: 'Điều cần giữ', sac: Sac.Nghich },
];

export function vanHanYearOf(
  chart: NatalChart,
  viewYear: number,
  currentYear: number,
): VanHanYear | null {
  if (viewYear < chart.lunar.year) return null;

  const tuoi = ageInYear(chart.lunar.year, viewYear);
  const daiVan = daiVanAt(chart.daiVan, tuoi);
  if (!daiVan) return null;

  const pillar = viewYearPillar(viewYear);
  const tieuHan = anTieuHan(chart.pillars.year.chi, chart.gender, tuoi);
  const daiVanKeTiep = chart.daiVan.find((span) => span.startAge === daiVan.endAge + 1) ?? null;

  return {
    viewYear,
    namCanChi: `${CAN[pillar.can]} ${CHI[pillar.chi]}`,
    tuoi,
    tone: viewYear < currentYear ? VanHanTone.LookBack : VanHanTone.Advice,
    daiVan,
    cungDaiVan: cungNameAt(daiVan.chiIndex, chart.menhIndex),
    namThuTrongVan: tuoi - daiVan.startAge + 1,
    tieuHan,
    cungTieuHan: cungNameAt(tieuHan, chart.menhIndex),
    daiVanKeTiep,
    cungDaiVanKeTiep: daiVanKeTiep ? cungNameAt(daiVanKeTiep.chiIndex, chart.menhIndex) : null,
    namBatDauVanKeTiep: daiVanKeTiep ? viewYear + daiVanKeTiep.startAge - tuoi : null,
  };
}

function tuHoaDaiVanOf(chart: NatalChart, daiVan: DaiVan): readonly TuHoa[] {
  return anTuHoaDaiVan(canOfCung(daiVan.chiIndex, chart.pillars.year.can));
}

function factsOf(year: VanHanYear): VanHanBriefFacts {
  return {
    namXem: year.viewYear,
    namCanChi: year.namCanChi,
    tuoi: year.tuoi,
    tone: year.tone,
    daiVanTuoi: `${year.daiVan.startAge}–${year.daiVan.endAge} tuổi`,
    namThuTrongVan: year.namThuTrongVan,
    cungDaiVan: year.cungDaiVan,
    cungTieuHan: year.cungTieuHan,
    chuDeVan: DAI_VAN_CHU_DE[year.cungDaiVan],
  };
}

export function buildVanHanBrief(chart: NatalChart, year: VanHanYear): VanHanBrief | null {
  const anchorIndex = year.daiVan.chiIndex;
  const tuHoa = tuHoaTacDongTai(chart, anchorIndex, tuHoaDaiVanOf(chart, year.daiVan));
  const lens = buildMenhLensBrief(chart, anchorIndex, tuHoa);
  return lens && { ...lens, vanHan: factsOf(year) };
}

function scaled(claim: LuanDe, star: SaoTrongBai): PlacedClaim {
  return { claim: { ...claim, trong: Math.round(claim.trong * THE_FACTOR[star.the]) }, star };
}

function luuTinhClaims(year: VanHanYear): PlacedClaim[] {
  return anLuuTinh(viewYearPillar(year.viewYear)).flatMap((placement) => {
    const the = theCuaChi(year.tieuHan, placement.chiIndex);
    const claim = LUU_TINH_CLAIM_BY_NAME[placement.name];
    if (!the || !claim) return [];
    return [scaled(claim, { ten: placement.name, the })];
  });
}

function hoaClaims(chart: NatalChart, year: VanHanYear): PlacedClaim[] {
  const starPlaces = starPlacesOf(chart);
  const tuHoa = [...anTuHoaLuuNien(year.viewYear), ...tuHoaDaiVanOf(chart, year.daiVan)];
  return tuHoa.flatMap((hoa) => {
    const chiIndex = starPlaces.get(hoa.star);
    const the = chiIndex === undefined ? null : theCuaChi(year.tieuHan, chiIndex);
    if (!the) return [];
    return [scaled(HOA_VAN_HAN_LUAN[hoa.hoa], { ten: hoa.hoa, the })];
  });
}

function strongestPerStar(claims: readonly PlacedClaim[]): PlacedClaim[] {
  const byStar = new Map<string, PlacedClaim>();
  for (const placed of claims) {
    const name = placed.claim.do.join(',');
    const kept = byStar.get(name);
    if (!kept || placed.claim.trong > kept.claim.trong) byStar.set(name, placed);
  }
  return [...byStar.values()];
}

function byWeight(a: PlacedClaim, b: PlacedClaim): number {
  return b.claim.trong - a.claim.trong;
}

function lensClaims(lens: ChapterBrief, yearStars: ReadonlySet<string>): PlacedClaim[] {
  const phuTinh = new Map<string, SaoTrongBai>(
    [...lens.catTinh, ...lens.hungTinh].map((star) => [star.ten, star]),
  );
  return lens.luan
    .filter((claim) => !claim.do.some((star) => yearStars.has(star)))
    .map((claim) => ({
      claim,
      star: claim.do.map((star) => phuTinh.get(star)).find((star) => star !== undefined) ?? null,
    }));
}

function starsOf(claims: readonly PlacedClaim[]): Pick<ChapterBrief, 'catTinh' | 'hungTinh'> {
  const stars = [
    ...new Map(claims.flatMap(({ star }) => (star ? [[star.ten, star] as const] : []))).values(),
  ];
  return {
    hungTinh: stars.filter((star) => isHungTinh(star.ten)),
    catTinh: stars.filter((star) => !isHungTinh(star.ten)),
  };
}

export function buildVanHanMucBriefs(
  chart: NatalChart,
  year: VanHanYear,
): readonly VanHanMucBrief[] {
  const tuHoaLuuNien = tuHoaTacDongTai(chart, year.tieuHan, anTuHoaLuuNien(year.viewYear));
  const lens = buildMenhLensBrief(chart, year.tieuHan, tuHoaLuuNien);
  if (!lens) return [];

  const yearClaims = strongestPerStar([...luuTinhClaims(year), ...hoaClaims(chart, year)]);
  const yearStars = new Set(yearClaims.flatMap(({ claim }) => claim.do));
  const natalClaims = lensClaims(lens, yearStars);

  return YEAR_MUCS.flatMap(({ muc, tieuDe, sac }) => {
    const chosen = [
      ...yearClaims.filter(({ claim }) => claim.sac === sac).sort(byWeight),
      ...natalClaims.filter(({ claim }) => claim.sac === sac).sort(byWeight),
    ].slice(0, MAX_MUC_CLAIMS);
    if (chosen.length < MIN_MUC_CLAIMS) return [];

    return [
      {
        ...lens,
        ...starsOf(chosen),
        vanHan: factsOf(year),
        muc,
        tieuDe,
        sourceCung: `${year.cungTieuHan} · ${CHI[year.tieuHan]}`,
        duKien: [],
        luan: chosen.map(({ claim }) => claim),
      },
    ];
  });
}
