import type { NatalChart, SaoView } from '../cast-chart.js';
import { mod12, tamHopIndexes, xungChieuIndex } from '../chi.js';
import { CUNG_NAMES } from '../dia-ban.js';
import { CHI } from '../lich/lunar-calendar.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { ChinhTinhName, SaoName } from '../sao-names.js';
import type { Rating } from '../sao-rating.js';
import { cachCucTai } from './bang/cach-cuc.js';
import { CHINH_TINH_QUAN_LOC } from './bang/quan-loc/chinh-tinh-quan-loc.js';
import type { CellLuan } from './bang/cell-luan.js';
import { PHU_TINH_QUAN_LOC } from './bang/quan-loc/phu-tinh-quan-loc.js';
import type { ChapterBrief } from './chapter-brief.js';
import { Sac, type LuanDe } from './luan-de.js';
import { TheChieu, theCungAt, type SaoTheoThe, type TheCung } from './the-cung.js';

const BRIGHTNESS_FACTOR: Record<Rating, number> = { M: 1.2, V: 1.1, Đ: 1.0, B: 0.9, H: 0.8 };
const THE_FACTOR: Record<TheChieu, number> = {
  [TheChieu.ToaThu]: 1,
  [TheChieu.XungChieu]: 0.75,
  [TheChieu.TamHop]: 0.6,
  [TheChieu.NhiHop]: 0.4,
};
const LIMIT: Record<Sac, number> = { [Sac.Thuan]: 2, [Sac.Nghich]: 2, [Sac.HoaGiai]: 1 };
const AN_NGU_FACTOR = 0.75;

const QUAN_LOC_OFFSET = CUNG_NAMES.indexOf('Quan Lộc');

export function quanLocIndexOf(chart: NatalChart): number {
  return mod12(chart.menhIndex + QUAN_LOC_OFFSET);
}

interface ChinhTinhTrongBai {
  readonly ten: ChinhTinhName;
  readonly bac: Rating | null;
  readonly the: TheChieu;
}

export interface CongDanhBrief extends ChapterBrief {
  readonly cung: 'Quan Lộc';
  readonly chinhTinh: readonly ChinhTinhTrongBai[];
}

interface DraftClaim {
  y: string;
  do: SaoName[];
  sac: Sac;
  trong: number;
  tuKhoa: string[];
}

function chinhTinhCua(sao: readonly SaoView<ChinhTinhName>[], the: TheChieu): ChinhTinhTrongBai[] {
  return sao.map((item) => ({ ten: item.name, bac: item.rating, the }));
}

function moRong(cell: CellLuan, bac: Rating | null): readonly LuanDe[] {
  return [...cell.chung, ...(bac ? (cell.theoBac?.[bac] ?? []) : [])];
}

function draft(claim: LuanDe, factor: number): DraftClaim {
  return {
    y: claim.y,
    do: [...claim.do],
    sac: claim.sac,
    trong: Math.round(claim.trong * factor),
    tuKhoa: [...claim.tuKhoa],
  };
}

function cull(claims: DraftClaim[]): DraftClaim[] {
  return Object.values(Sac).flatMap((sac) =>
    claims
      .filter((claim) => claim.sac === sac)
      .sort((a, b) => b.trong - a.trong)
      .slice(0, LIMIT[sac]),
  );
}

function gopCachCuc(
  baseClaims: readonly DraftClaim[],
  cachCucClaims: readonly DraftClaim[],
  tenChinhTinh: ReadonlySet<SaoName>,
): DraftClaim[] {
  return Object.values(Sac).flatMap((sac) => {
    const chinhTinhCuaSac = baseClaims
      .filter((claim) => claim.sac === sac && claim.do.some((sao) => tenChinhTinh.has(sao)))
      .sort((a, b) => b.trong - a.trong);
    const giuLai = chinhTinhCuaSac[0];

    const conLai = [...baseClaims, ...cachCucClaims]
      .filter((claim) => claim.sac === sac && claim !== giuLai)
      .sort((a, b) => b.trong - a.trong)
      .slice(0, LIMIT[sac] - (giuLai ? 1 : 0));

    return giuLai ? [giuLai, ...conLai] : conLai;
  });
}

function phuTinhClaims(phuTinh: readonly SaoTheoThe[]): DraftClaim[] {
  return phuTinh.flatMap((sao) => {
    const claim = PHU_TINH_QUAN_LOC[sao.name];
    if (!claim) return [];
    const factor = THE_FACTOR[sao.the] * (sao.bienAnNgu ? AN_NGU_FACTOR : 1);
    return [draft(claim, factor)];
  });
}

const HOA_KY_GIAM_THUAN = 0.55;
const HOA_KHAC_BONUS = 10;

function applyTuHoa(claims: DraftClaim[], the: TheCung): DraftClaim[] {
  const themVao: DraftClaim[] = [];

  for (const hoa of the.tuHoaTacDong) {
    for (const claim of claims) {
      if (!claim.do.includes(hoa.star)) continue;

      if (hoa.hoa !== 'Hóa Kỵ') {
        claim.trong += HOA_KHAC_BONUS;
        continue;
      }
      if (claim.sac === Sac.Thuan) {
        claim.trong = Math.round(claim.trong * HOA_KY_GIAM_THUAN);
      }
    }

    if (hoa.hoa === 'Hóa Kỵ' && claims.some((claim) => claim.do.includes(hoa.star))) {
      themVao.push({
        y: 'phần thuận lợi bị vướng lại, muốn được việc thì cũng phải qua trắc trở',
        do: [hoa.star],
        sac: Sac.Nghich,
        trong: 80,
        tuKhoa: ['vướng lại', 'trắc trở'],
      });
    }
  }

  return [...claims, ...themVao];
}

export function buildCongDanhBrief(chart: NatalChart): CongDanhBrief | null {
  const quanLocIndex = quanLocIndexOf(chart);
  const the = theCungAt(chart, quanLocIndex);
  const [tamHopA, tamHopB] = tamHopIndexes(quanLocIndex);

  const chinhTinh = [
    ...chinhTinhCua(chart.cungs[quanLocIndex].chinhTinh, TheChieu.ToaThu),
    ...chinhTinhCua(chart.cungs[xungChieuIndex(quanLocIndex)].chinhTinh, TheChieu.XungChieu),
    ...chinhTinhCua(chart.cungs[tamHopA].chinhTinh, TheChieu.TamHop),
    ...chinhTinhCua(chart.cungs[tamHopB].chinhTinh, TheChieu.TamHop),
  ];

  const baseClaims = applyTuHoa(
    [
      ...chinhTinh.flatMap((sao) => {
        const cell = CHINH_TINH_QUAN_LOC[sao.ten];
        if (!cell) return [];
        const factor = THE_FACTOR[sao.the] * (BRIGHTNESS_FACTOR[sao.bac ?? 'B'] ?? 1);
        return moRong(cell, sao.bac).map((claim) => draft(claim, factor));
      }),
      ...phuTinhClaims(the.phuTinh),
    ],
    the,
  );

  if (the.anNgu) {
    for (const claim of baseClaims) claim.trong = Math.round(claim.trong * AN_NGU_FACTOR);
  }

  const coTheXayNen = cull(baseClaims);
  const tenChinhTinh = new Set<SaoName>(chinhTinh.map((sao) => sao.ten));
  const coNen = coTheXayNen.some((claim) => claim.do.some((sao) => tenChinhTinh.has(sao)));
  const coMach =
    coTheXayNen.some((claim) => claim.sac === Sac.Thuan) &&
    coTheXayNen.some((claim) => claim.sac === Sac.Nghich);
  if (!coNen || !coMach) return null;

  const cachCucClaims = cachCucTai(chart, quanLocIndex).flatMap((cach) =>
    cach.luan.map((claim) => draft(claim, the.anNgu ? AN_NGU_FACTOR : 1)),
  );
  const luan = gopCachCuc(baseClaims, cachCucClaims, tenChinhTinh);

  const daDung = new Set(luan.flatMap((claim) => claim.do));
  const phuTinhTrongBai = the.phuTinh
    .filter((sao) => daDung.has(sao.name))
    .map((sao) => ({ ten: sao.name, the: sao.the }));

  return {
    cung: 'Quan Lộc',
    chi: CHI[quanLocIndex],
    gioiTinh: chart.gender,
    chiNamSinh: CHI[chart.pillars.year.chi],
    laVoChinhDieu: chart.cungs[quanLocIndex].isVoChinhDieu,
    chinhTinh,
    hungTinh: phuTinhTrongBai.filter((sao) => isHungTinh(sao.ten)),
    catTinh: phuTinhTrongBai.filter((sao) => !isHungTinh(sao.ten)),
    anNgu: the.anNgu,
    luan,
  };
}
