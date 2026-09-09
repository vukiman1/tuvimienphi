import type { NatalChart } from '../cast-chart.js';
import { CHI_NGU_HANH, theSinhKhac } from '../chi-ngu-hanh.js';
import { nhiHopIndex, tamHopIndexes, xungChieuIndex } from '../chi.js';
import { CHINH_TINH_NGU_HANH } from '../sao-ngu-hanh-data.js';
import { CHI } from '../lich/lunar-calendar.js';
import { HOA_NAMES, type HoaName } from '../tu-hoa.js';
import { MENH_THAN_LUAN, TheMenhThan } from './bang/menh-than.js';
import { cachCucTai } from './bang/cach-cuc.js';
import { SINH_KHAC_LUAN } from './bang/sinh-khac.js';
import { AN_NGU_LUAN, TU_HOA_LUAN } from './bang/the-cuc.js';
import { TRANG_SINH_LUAN } from './bang/trang-sinh.js';
import { buildThanCuBrief, type ThanCuBrief } from './build-than-cu-brief.js';
import { Sac, type LuanDe } from './luan-de.js';
import { TheChieu, theCungAt } from './the-cung.js';

export enum MucKey {
  ThoiDiem = 'thoi-diem',
  MenhThan = 'menh-than',
  TheCuc = 'the-cuc',
}

/**
 * Một mục con của bài. Mang theo nguyên phần lá số của brief chính để năm tầng kiểm chạy được y
 * nguyên, chỉ khác `luan` và có thêm dữ kiện riêng.
 */
export interface MucBrief extends ThanCuBrief {
  readonly muc: MucKey;
  readonly tieuDe: string;
  /** Cung mà mục này đọc từ đó, hiện lên thẻ mục con — xem `LuanGiaiSection.sourceCung`. */
  readonly sourceCung: string;
  /** Dữ kiện cụ thể bài BẮT BUỘC phải dẫn, ví dụ mốc tuổi đại vận. */
  readonly duKien: readonly string[];
}

/** Dưới ngần này thì mục quá mỏng, thà không có còn hơn có một câu cụt. */
const TOI_THIEU_MENH_DE = 2;

/** Mục chỉ có hai câu. Quá ba mệnh đề là mô hình buộc phải liệt kê, đo được từ bài chính. */
const TRAN_MENH_DE = 3;

export function theMenhThan(menhIndex: number, thanIndex: number): TheMenhThan {
  if (menhIndex === thanIndex) return TheMenhThan.Trung;
  if (tamHopIndexes(menhIndex).includes(thanIndex)) return TheMenhThan.TamHop;
  if (xungChieuIndex(menhIndex) === thanIndex) return TheMenhThan.XungChieu;
  if (nhiHopIndex(menhIndex) === thanIndex) return TheMenhThan.NhiHop;
  return TheMenhThan.Khac;
}

function thoiDiem(chart: NatalChart): { luan: LuanDe[]; duKien: string[] } {
  const luan: LuanDe[] = [];
  const duKien: string[] = [];

  const van = chart.daiVan.find((moc) => moc.chiIndex === chart.thanIndex);
  if (van) {
    duKien.push(`đại vận ${van.startAge}–${van.endAge} tuổi`);
    luan.push({
      y: `cung này vào đại vận khoảng ${van.startAge} đến ${van.endAge} tuổi, đó là quãng nó lên tiếng rõ nhất`,
      do: [],
      sac: Sac.Thuan,
      trong: 90,
      tuKhoa: [String(van.startAge), String(van.endAge)],
    });
  }

  const trangSinh = chart.cungs[chart.thanIndex].trangSinh;
  const deTrangSinh = TRANG_SINH_LUAN[trangSinh];
  if (deTrangSinh) {
    duKien.push(`vòng Tràng Sinh đang ở cung ${trangSinh}`);
    luan.push(deTrangSinh);
  }

  return { luan, duKien };
}

function theCuc(chart: NatalChart): { luan: LuanDe[]; duKien: string[] } {
  const the = theCungAt(chart, chart.thanIndex);
  const luan: LuanDe[] = [];
  const duKien: string[] = [];

  if (the.anNgu) {
    duKien.push(`${the.anNgu} án ngữ`);
    luan.push(...AN_NGU_LUAN[the.anNgu]);
  }

  for (const cach of cachCucTai(chart, chart.thanIndex)) {
    duKien.push(`cách ${cach.ten}`);
    luan.push(...cach.luan);
  }

  // Thế ngũ hành giữa sao và cung, độc lập với miếu vượng: sao miếu mà bị cung khắc thì mạnh mà
  // không thoải mái, sao bình mà được cung sinh thì lại dễ thở.
  // Không đưa thế sinh khắc vào `duKien`: nó là nhãn phân loại, không phải dữ kiện người đọc cần
  // nghe nguyên văn. Đưa vào thì mô hình dán thẳng "Thiên Đồng với cung hành Mộc: sao sinh cung"
  // vào giữa câu — đo được. Ý nghĩa đã nằm trong chính mệnh đề.
  const hanhCung = CHI_NGU_HANH[the.chiIndex];
  for (const sao of the.chinhTinh) {
    luan.push(SINH_KHAC_LUAN[theSinhKhac(CHINH_TINH_NGU_HANH[sao.name], hanhCung)]);
  }

  // Chỉ lấy hoá toạ thủ: hoá ở cung khác chiếu sang là chuyện của cung đó, không phải thế cục ở đây.
  const hoaTaiCho = the.phuTinh
    .filter((sao) => sao.the === TheChieu.ToaThu)
    .map((sao) => sao.name)
    .filter((ten): ten is HoaName => (HOA_NAMES as readonly string[]).includes(ten));

  for (const hoa of hoaTaiCho) {
    duKien.push(`${hoa} toạ thủ`);
    luan.push(TU_HOA_LUAN[hoa]);
  }

  return { luan: cat(luan), duKien };
}

/** Giữ những mệnh đề nặng nhất; phần còn lại nhồi vào hai câu chỉ ra danh sách. */
function cat(luan: readonly LuanDe[]): LuanDe[] {
  return [...luan].sort((a, b) => b.trong - a.trong).slice(0, TRAN_MENH_DE);
}

/**
 * Ba mục con nối sau hai đoạn chính. Mục nào không đủ mệnh đề thì bỏ hẳn — bài ngắn hơn vẫn tốt hơn
 * một mục viết cho có.
 *
 * Bài Thân cư mà không nói KHI NÀO là bỏ mất chính cái làm Thân khác Mệnh: Mệnh chủ tiền vận, Thân
 * chủ hậu vận. Nên mục thời điểm đứng trước.
 */
export function buildMucBriefs(chart: NatalChart): readonly MucBrief[] {
  const goc = buildThanCuBrief(chart);
  if (!goc) return [];

  const nguon = `${goc.cungThan} · ${CHI[chart.cungs[chart.thanIndex].chiIndex]}`;
  const menhThan = theMenhThan(chart.menhIndex, chart.thanIndex);

  const dinhNghia = [
    { muc: MucKey.ThoiDiem, tieuDe: 'Thời điểm', ...thoiDiem(chart) },
    {
      muc: MucKey.MenhThan,
      tieuDe: 'Mệnh và Thân',
      luan: [...MENH_THAN_LUAN[menhThan]],
      duKien: [`Mệnh và Thân ${menhThan}`],
    },
    { muc: MucKey.TheCuc, tieuDe: 'Thế cục', ...theCuc(chart) },
  ];

  return dinhNghia
    .filter((mot) => mot.luan.length >= TOI_THIEU_MENH_DE)
    .map((mot) => ({
      ...goc,
      muc: mot.muc,
      tieuDe: mot.tieuDe,
      sourceCung: nguon,
      duKien: mot.duKien,
      luan: mot.luan,
    }));
}
