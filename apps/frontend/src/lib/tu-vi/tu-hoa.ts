import type { PhuTinhName, SaoName } from '@/lib/tu-vi/sao-names';

/** Bốn hoá khí, luôn theo đúng thứ tự Lộc – Quyền – Khoa – Kỵ. */
export const HOA_NAMES = [
  'Hóa Lộc',
  'Hóa Quyền',
  'Hóa Khoa',
  'Hóa Kỵ',
] as const satisfies readonly PhuTinhName[];

export type HoaName = (typeof HOA_NAMES)[number];

export interface TuHoa {
  readonly hoa: HoaName;
  /** Chính tinh hoặc phụ tinh nhận hoá khí đó. */
  readonly star: SaoName;
}

/**
 * Tứ hoá sinh niên tra thẳng theo can năm — không suy ra được bằng công thức, phải chép bảng.
 * Hàng thứ bảy (Canh) là hàng khác nhau nhiều nhất giữa các trường phái; ở đây lấy Nhật – Vũ – Âm –
 * Đồng, đúng với lá số đối chiếu trên tuvi.vn.
 */
const TU_HOA_BY_YEAR_CAN: ReadonlyArray<readonly [SaoName, SaoName, SaoName, SaoName]> = [
  ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'], // Giáp
  ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'], // Ất
  ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'], // Bính
  ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'], // Đinh
  ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'], // Mậu
  ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'], // Kỷ
  ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'], // Canh
  ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'], // Tân
  ['Thiên Lương', 'Tử Vi', 'Tả Phù', 'Vũ Khúc'], // Nhâm
  ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'], // Quý
];

export function anTuHoa(yearCan: number): readonly TuHoa[] {
  return TU_HOA_BY_YEAR_CAN[yearCan].map((star, index) => ({ hoa: HOA_NAMES[index], star }));
}
