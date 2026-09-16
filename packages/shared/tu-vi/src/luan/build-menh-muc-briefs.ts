import type { NatalChart } from '../cast-chart.js';
import { CHI_NGU_HANH, theSinhKhac } from '../chi-ngu-hanh.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { PhuTinhName } from '../sao-names.js';
import { CHINH_TINH_NGU_HANH } from '../sao-ngu-hanh-data.js';
import { cachCucTai } from './bang/cach-cuc.js';
import { PHU_TINH_LUAN } from './bang/phu-tinh.js';
import { SINH_KHAC_LUAN } from './bang/sinh-khac.js';
import { buildMenhBrief, type MenhBrief } from './build-menh-brief.js';
import type { MucExtras } from './chapter-brief.js';
import type { LuanDe } from './luan-de.js';
import { theCungAt, type TheChieu } from './the-cung.js';

export enum MenhMucKey {
  DiemManh = 'diem-manh',
  DiemCanGiu = 'diem-can-giu',
  NguHanh = 'ngu-hanh',
}

/**
 * Một mục con của bài Mệnh. Mang nguyên phần lá số của brief chính để năm tầng kiểm chạy y nguyên,
 * chỉ khác `luan` và có thêm dữ kiện riêng.
 */
export interface MenhMucBrief extends MenhBrief, MucExtras<MenhMucKey> {}

/** Dưới ngần này thì mục quá mỏng, thà không có còn hơn có một câu cụt. */
const TOI_THIEU_MENH_DE = 2;

/** Mục chỉ có hai câu. Quá ba mệnh đề là mô hình buộc phải liệt kê. */
const TRAN_MENH_DE = 3;

function catBot(luan: readonly LuanDe[]): LuanDe[] {
  return [...luan].sort((a, b) => b.trong - a.trong).slice(0, TRAN_MENH_DE);
}

/** Mệnh đề của phụ tinh trong tam phương tứ chính, tách theo vai cát hay hung. */
function phuTinhTheoVai(chart: NatalChart, muonHung: boolean): LuanDe[] {
  const the = theCungAt(chart, chart.menhIndex);
  const luan = the.phuTinh
    .filter((sao) => isHungTinh(sao.name) === muonHung)
    .map((sao) => PHU_TINH_LUAN[sao.name])
    .filter((claim): claim is LuanDe => claim !== undefined);

  return catBot(luan);
}

/**
 * Ngũ hành của người: cục và bản mệnh là con số của riêng lá số này, còn thế sinh khắc giữa chính
 * tinh với cung nói sao ấy dùng sức có thoải mái hay không, độc lập với miếu vượng.
 */
function nguHanh(chart: NatalChart): { luan: LuanDe[]; duKien: string[] } {
  const the = theCungAt(chart, chart.menhIndex);
  const duKien = [chart.cuc.name, `bản mệnh ${chart.banMenh}`];
  const luan: LuanDe[] = [];

  const hanhCung = CHI_NGU_HANH[the.chiIndex];
  for (const sao of the.chinhTinh) {
    luan.push(SINH_KHAC_LUAN[theSinhKhac(CHINH_TINH_NGU_HANH[sao.name], hanhCung)]);
  }

  for (const cach of cachCucTai(chart, chart.menhIndex)) {
    duKien.push(`cách ${cach.ten}`);
    luan.push(...cach.luan);
  }

  return { luan: catBot(luan), duKien };
}

/**
 * Sao đứng sau mệnh đề của RIÊNG mục này. Mục mang danh sách sao của bài chính thì bộ kiểm báo tên
 * sao "không có trong brief" và cả mục bị bỏ — đo được trên bài thật.
 */
function saoCuaMuc(
  chart: NatalChart,
  luan: readonly LuanDe[],
): {
  hungTinh: { ten: PhuTinhName; the: TheChieu }[];
  catTinh: { ten: PhuTinhName; the: TheChieu }[];
} {
  const daDung = new Set(luan.flatMap((de) => de.do));
  const trongBai = theCungAt(chart, chart.menhIndex)
    .phuTinh.filter((sao) => daDung.has(sao.name))
    .map((sao) => ({ ten: sao.name, the: sao.the }));

  return {
    hungTinh: trongBai.filter((sao) => isHungTinh(sao.ten)),
    catTinh: trongBai.filter((sao) => !isHungTinh(sao.ten)),
  };
}

/**
 * Ba mục con nối sau hai đoạn chính. Mục nào không đủ mệnh đề thì bỏ hẳn — bài ngắn hơn vẫn tốt hơn
 * một mục viết cho có.
 */
export function buildMenhMucBriefs(chart: NatalChart): readonly MenhMucBrief[] {
  const goc = buildMenhBrief(chart);
  if (!goc) return [];

  const dinhNghia = [
    {
      muc: MenhMucKey.DiemManh,
      tieuDe: 'Điểm mạnh',
      luan: phuTinhTheoVai(chart, false),
      duKien: [] as string[],
    },
    {
      muc: MenhMucKey.DiemCanGiu,
      tieuDe: 'Điểm cần giữ',
      luan: phuTinhTheoVai(chart, true),
      duKien: [] as string[],
    },
    { muc: MenhMucKey.NguHanh, tieuDe: 'Ngũ hành bản mệnh', ...nguHanh(chart) },
  ];

  return dinhNghia
    .filter((mot) => mot.luan.length >= TOI_THIEU_MENH_DE)
    .map((mot) => ({
      ...goc,
      ...saoCuaMuc(chart, mot.luan),
      muc: mot.muc,
      tieuDe: mot.tieuDe,
      sourceCung: `Mệnh · ${goc.chi}`,
      duKien: mot.duKien,
      luan: mot.luan,
    }));
}
