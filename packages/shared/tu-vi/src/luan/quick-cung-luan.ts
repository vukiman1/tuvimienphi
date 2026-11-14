import type { NatalChart } from '../cast-chart.js';
import type { CungName } from '../dia-ban.js';
import { BANG_PHU_MAU } from './bang/phu-mau/bang-phu-mau.js';
import { BANG_PHU_THE } from './bang/phu-the/bang-phu-the.js';
import { BANG_QUAN_LOC } from './bang/quan-loc/bang-quan-loc.js';
import { BANG_TAI_BACH } from './bang/tai-bach/bang-tai-bach.js';
import { BANG_TU_TUC } from './bang/tu-tuc/bang-tu-tuc.js';
import { buildCungBrief } from './build-cung-brief.js';
import { buildMenhBrief } from './build-menh-brief.js';
import type { ChapterBrief } from './chapter-brief.js';
import { Sac, type LuanDe } from './luan-de.js';

export interface QuickCungLuan {
  readonly thuan: LuanDe;
  readonly nghich: LuanDe;
}

type BriefBuilder = (chart: NatalChart) => ChapterBrief | null;

const BRIEF_BUILDER_BY_CUNG: Readonly<Partial<Record<CungName, BriefBuilder>>> = {
  Mệnh: buildMenhBrief,
  'Phụ Mẫu': (chart) => buildCungBrief(chart, BANG_PHU_MAU),
  'Phu Thê': (chart) => buildCungBrief(chart, BANG_PHU_THE),
  'Quan Lộc': (chart) => buildCungBrief(chart, BANG_QUAN_LOC),
  'Tài Bạch': (chart) => buildCungBrief(chart, BANG_TAI_BACH),
  'Tử Tức': (chart) => buildCungBrief(chart, BANG_TU_TUC),
};

export const QUICK_LUAN_CUNG: readonly CungName[] = [
  'Mệnh',
  'Phụ Mẫu',
  'Phu Thê',
  'Quan Lộc',
  'Tài Bạch',
  'Tử Tức',
];

export function quickCungLuan(chart: NatalChart, cung: CungName): QuickCungLuan | null {
  const brief = BRIEF_BUILDER_BY_CUNG[cung]?.(chart);
  if (!brief) return null;
  const thuan = brief.luan.find((claim) => claim.sac === Sac.Thuan);
  const nghich = brief.luan.find((claim) => claim.sac === Sac.Nghich);
  if (!thuan || !nghich) return null;
  return { thuan, nghich };
}
