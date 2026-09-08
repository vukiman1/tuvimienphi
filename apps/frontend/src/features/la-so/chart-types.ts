import { type NguHanh, type PhuTinhName, type Rating } from '@org/shared-tu-vi';

/** Kiểu dữ liệu mà giao diện lá số cần. Engine an sao sẽ trả về đúng hình dạng này. */

export interface SaoView {
  readonly name: PhuTinhName;
  readonly rating: Rating | null;
  /** Ngũ hành của sao, quyết định màu chữ. */
  readonly element: NguHanh;
}

export interface ChinhTinhView {
  readonly name: string;
  readonly polarity: string | null;
  readonly rating: Rating | null;
  readonly element: NguHanh;
}

export interface CungView {
  /** 0..11 tương ứng Tý..Hợi. */
  readonly index: number;
  readonly chi: string;
  /** Can viết tắt kèm chi, ví dụ "C.Thìn". */
  readonly canChi: string;
  readonly name: string;
  /** Âm dương và ngũ hành của cung, ví dụ "+Thổ". */
  readonly element: string;
  readonly daiVanStartAge: number;
  /** Cung tháng, ví dụ "Th.10". */
  readonly monthOrder: string;
  readonly isMenh: boolean;
  readonly isThan: boolean;
  readonly hasTuan: boolean;
  readonly hasTriet: boolean;
  /** Tên cung theo đại vận đang xem, ví dụ "ĐV.PHỐI". */
  readonly daiVan: string;
  readonly trangSinh: string;
  /** Tên cung theo lưu niên, ví dụ "LN.ĐIỀN". */
  readonly luuNien: string;
  /** Sao của tầng lưu niên, in kèm tiền tố `L.`. */
  readonly luuTinh: readonly SaoView[];
  /** Sao của tầng lưu đại vận, in kèm tiền tố `ĐV.`. */
  readonly daiVanTinh: readonly SaoView[];
  readonly chinhTinh: readonly ChinhTinhView[];
  /** Cung không có chính tinh nào toạ thủ. */
  readonly isVoChinhDieu: boolean;
  /** Chính tinh mượn từ cung xung chiếu; chỉ có khi cung vô chính diệu. */
  readonly chinhTinhMuon: readonly ChinhTinhView[];
  /** Cột trái của ô. */
  readonly catTinh: readonly SaoView[];
  /** Cột phải của ô. */
  readonly hungTinh: readonly SaoView[];
}

export interface ChartMeta {
  readonly fullName: string;
  readonly solarYear: string;
  readonly lunarYear: string;
  readonly solarMonth: string;
  readonly lunarMonth: string;
  readonly solarDay: string;
  readonly lunarDay: string;
  readonly solarHour: string;
  readonly lunarHour: string;
  readonly viewYear: string;
  readonly amDuong: string;
  readonly banMenh: string;
  readonly canLuong: string;
  readonly chuMenh: string;
  readonly chuThan: string;
  readonly laiNhanCung: string;
}

export interface ChartView {
  readonly meta: ChartMeta;
  /** 12 cung theo thứ tự địa chi Tý..Hợi. */
  readonly cungs: readonly CungView[];
}
