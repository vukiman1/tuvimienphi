/** Kiểu dữ liệu mà giao diện lá số cần. Engine an sao sẽ trả về đúng hình dạng này. */

/** Sắc thái của một sao trên lá số — quyết định màu chữ, không mang ý nghĩa luận giải. */
export type SaoTone = 'default' | 'amber' | 'green' | 'red' | 'muted';

export interface SaoView {
  readonly name: string;
  /** Miếu / Vượng / Đắc / Bình / Hãm, in trong ngoặc sau tên sao. */
  readonly rating: string | null;
  readonly tone: SaoTone;
}

export interface ChinhTinhView {
  readonly name: string;
  readonly polarity: string | null;
  readonly rating: string | null;
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
  readonly chinhTinh: readonly ChinhTinhView[];
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
