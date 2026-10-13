import type { NatalChart } from '../cast-chart.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { PhuTinhName } from '../sao-names.js';
import { PHU_TINH_QUAN_LOC } from './bang/quan-loc/phu-tinh-quan-loc.js';
import { buildCongDanhBrief, quanLocIndexOf, type CongDanhBrief } from './build-cong-danh-brief.js';
import type { MucExtras } from './chapter-brief.js';
import { type LuanDe } from './luan-de.js';
import { theCungAt, type TheChieu } from './the-cung.js';

export enum CongDanhMucKey {
  DiemManh = 'diem-manh',
  DiemCanGiu = 'diem-can-giu',
}

export interface CongDanhMucBrief extends CongDanhBrief, MucExtras<CongDanhMucKey> {}

const TOI_THIEU_MENH_DE = 2;
const TRAN_MENH_DE = 3;

function catBot(luan: readonly LuanDe[]): LuanDe[] {
  return [...luan].sort((a, b) => b.trong - a.trong).slice(0, TRAN_MENH_DE);
}

function phuTinhTheoVai(chart: NatalChart, muonHung: boolean): LuanDe[] {
  const the = theCungAt(chart, quanLocIndexOf(chart));
  const luan = the.phuTinh
    .filter((sao) => isHungTinh(sao.name) === muonHung)
    .map((sao) => PHU_TINH_QUAN_LOC[sao.name])
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
  const trongBai = theCungAt(chart, quanLocIndexOf(chart))
    .phuTinh.filter((sao) => daDung.has(sao.name))
    .map((sao) => ({ ten: sao.name, the: sao.the }));

  return {
    hungTinh: trongBai.filter((sao) => isHungTinh(sao.ten)),
    catTinh: trongBai.filter((sao) => !isHungTinh(sao.ten)),
  };
}

export function buildCongDanhMucBriefs(chart: NatalChart): readonly CongDanhMucBrief[] {
  const goc = buildCongDanhBrief(chart);
  if (!goc) return [];

  const dinhNghia = [
    {
      muc: CongDanhMucKey.DiemManh,
      tieuDe: 'Điểm mạnh trong sự nghiệp',
      luan: phuTinhTheoVai(chart, false),
    },
    {
      muc: CongDanhMucKey.DiemCanGiu,
      tieuDe: 'Điểm cần giữ trong sự nghiệp',
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
      sourceCung: `Quan Lộc · ${goc.chi}`,
      duKien: [] as string[],
      luan: mot.luan,
    }));
}
