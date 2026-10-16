import type { NatalChart } from '../cast-chart.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { PhuTinhName } from '../sao-names.js';
import type { CungLuanBang } from './bang/cung-luan-bang.js';
import { buildCungBrief, cungIndexOf, type CungBrief } from './build-cung-brief.js';
import type { MucExtras } from './chapter-brief.js';
import { type LuanDe } from './luan-de.js';
import { theCungAt, type TheChieu } from './the-cung.js';

export enum PhuTinhMucKey {
  DiemManh = 'diem-manh',
  DiemCanGiu = 'diem-can-giu',
}

export interface CungMucBrief<K extends string = string> extends CungBrief, MucExtras<K> {}

const TOI_THIEU_MENH_DE = 2;
const TRAN_MENH_DE = 3;

function catBot(luan: readonly LuanDe[]): LuanDe[] {
  return [...luan].sort((a, b) => b.trong - a.trong).slice(0, TRAN_MENH_DE);
}

function phuTinhTheoVai(chart: NatalChart, bang: CungLuanBang, muonHung: boolean): LuanDe[] {
  const the = theCungAt(chart, cungIndexOf(chart, bang.cung));
  const luan = the.phuTinh
    .filter((sao) => isHungTinh(sao.name) === muonHung)
    .map((sao) => bang.phuTinh[sao.name])
    .filter((claim): claim is LuanDe => claim !== undefined);

  return catBot(luan);
}

function saoCuaMuc(
  chart: NatalChart,
  bang: CungLuanBang,
  luan: readonly LuanDe[],
): {
  hungTinh: { ten: PhuTinhName; the: TheChieu }[];
  catTinh: { ten: PhuTinhName; the: TheChieu }[];
} {
  const daDung = new Set(luan.flatMap((de) => de.do));
  const trongBai = theCungAt(chart, cungIndexOf(chart, bang.cung))
    .phuTinh.filter((sao) => daDung.has(sao.name))
    .map((sao) => ({ ten: sao.name, the: sao.the }));

  return {
    hungTinh: trongBai.filter((sao) => isHungTinh(sao.ten)),
    catTinh: trongBai.filter((sao) => !isHungTinh(sao.ten)),
  };
}

export function buildPhuTinhMucBriefs(
  chart: NatalChart,
  bang: CungLuanBang,
  linhVuc: string,
): readonly CungMucBrief<PhuTinhMucKey>[] {
  const goc = buildCungBrief(chart, bang);
  if (!goc) return [];

  const dinhNghia = [
    {
      muc: PhuTinhMucKey.DiemManh,
      tieuDe: `Điểm mạnh trong ${linhVuc}`,
      luan: phuTinhTheoVai(chart, bang, false),
    },
    {
      muc: PhuTinhMucKey.DiemCanGiu,
      tieuDe: `Điểm cần giữ trong ${linhVuc}`,
      luan: phuTinhTheoVai(chart, bang, true),
    },
  ];

  return dinhNghia
    .filter((mot) => mot.luan.length >= TOI_THIEU_MENH_DE)
    .map((mot) => ({
      ...goc,
      ...saoCuaMuc(chart, bang, mot.luan),
      muc: mot.muc,
      tieuDe: mot.tieuDe,
      sourceCung: `${bang.cung} · ${goc.chi}`,
      duKien: [] as string[],
      luan: mot.luan,
    }));
}
