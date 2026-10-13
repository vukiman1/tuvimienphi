import type { NatalChart } from '../cast-chart.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { PhuTinhName } from '../sao-names.js';
import { PHU_TINH_TAI_BACH } from './bang/tai-bach/phu-tinh-tai-bach.js';
import { buildTaiBachBrief, taiBachIndexOf, type TaiBachBrief } from './build-tai-bach-brief.js';
import type { MucExtras } from './chapter-brief.js';
import { type LuanDe } from './luan-de.js';
import { theCungAt, type TheChieu } from './the-cung.js';

export enum TaiBachMucKey {
  DiemManh = 'diem-manh',
  DiemCanGiu = 'diem-can-giu',
}

export interface TaiBachMucBrief extends TaiBachBrief, MucExtras<TaiBachMucKey> {}

const TOI_THIEU_MENH_DE = 2;
const TRAN_MENH_DE = 3;

function catBot(luan: readonly LuanDe[]): LuanDe[] {
  return [...luan].sort((a, b) => b.trong - a.trong).slice(0, TRAN_MENH_DE);
}

function phuTinhTheoVai(chart: NatalChart, muonHung: boolean): LuanDe[] {
  const the = theCungAt(chart, taiBachIndexOf(chart));
  const luan = the.phuTinh
    .filter((sao) => isHungTinh(sao.name) === muonHung)
    .map((sao) => PHU_TINH_TAI_BACH[sao.name])
    .filter((claim): claim is LuanDe => claim !== undefined);

  return catBot(luan);
}

function saoCuaMuc(
  chart: NatalChart,
  luan: readonly LuanDe[],
): {
  hungTinh: { ten: PhuTinhName; the: TheChieu }[];
  catTinh: { ten: PhuTinhName; the: TheChieu }[];
} {
  const daDung = new Set(luan.flatMap((de) => de.do));
  const trongBai = theCungAt(chart, taiBachIndexOf(chart))
    .phuTinh.filter((sao) => daDung.has(sao.name))
    .map((sao) => ({ ten: sao.name, the: sao.the }));

  return {
    hungTinh: trongBai.filter((sao) => isHungTinh(sao.ten)),
    catTinh: trongBai.filter((sao) => !isHungTinh(sao.ten)),
  };
}

export function buildTaiBachMucBriefs(chart: NatalChart): readonly TaiBachMucBrief[] {
  const goc = buildTaiBachBrief(chart);
  if (!goc) return [];

  const dinhNghia = [
    {
      muc: TaiBachMucKey.DiemManh,
      tieuDe: 'Điểm mạnh trong tài chính',
      luan: phuTinhTheoVai(chart, false),
    },
    {
      muc: TaiBachMucKey.DiemCanGiu,
      tieuDe: 'Điểm cần giữ trong tài chính',
      luan: phuTinhTheoVai(chart, true),
    },
  ];

  return dinhNghia
    .filter((mot) => mot.luan.length >= TOI_THIEU_MENH_DE)
    .map((mot) => ({
      ...goc,
      ...saoCuaMuc(chart, mot.luan),
      muc: mot.muc,
      tieuDe: mot.tieuDe,
      sourceCung: `Tài Bạch · ${goc.chi}`,
      duKien: [] as string[],
      luan: mot.luan,
    }));
}
