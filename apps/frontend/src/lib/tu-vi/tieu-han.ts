import { CHI_COUNT, mod12 } from '@/lib/tu-vi/chi';
import { Gender } from '@/lib/tu-vi/van-han';

/**
 * Tiểu hạn và cung tháng. Cả hai đều phụ thuộc năm đang xem, nên tách khỏi `van-han.ts` — file đó
 * chỉ lo những tầng cố định theo lá số.
 *
 * Chiều đi của tiểu hạn là **nam thuận nữ nghịch**, khác với đại vận (dương nam âm nữ thuận). Hai
 * người cùng tuổi cùng giới nhưng khác can năm sẽ chạy đại vận ngược nhau mà tiểu hạn cùng chiều.
 */

/** Cung khởi tiểu hạn ở tuổi 1, theo nhóm tam hợp của chi năm sinh. */
const TIEU_HAN_START: readonly number[] = [
  10, // Tý   — Thân Tý Thìn khởi Tuất
  7, // Sửu  — Tị Dậu Sửu khởi Mùi
  4, // Dần  — Dần Ngọ Tuất khởi Thìn
  1, // Mão  — Hợi Mão Mùi khởi Sửu
  10, // Thìn
  7, // Tị
  4, // Ngọ
  1, // Mùi
  10, // Thân
  7, // Dậu
  4, // Tuất
  1, // Hợi
];

const MONTH_COUNT = 12;

/** Cung tiểu hạn của một tuổi. Tuổi tính theo tuổi mụ, khởi từ 1. */
export function anTieuHan(yearChi: number, gender: Gender, age: number): number {
  const step = gender === Gender.Nam ? 1 : -1;
  return mod12(TIEU_HAN_START[yearChi] + step * (age - 1));
}

/**
 * Cung tháng Giêng: từ cung tiểu hạn đếm nghịch tới tháng sinh rồi đếm thuận tới giờ sinh — đúng
 * cách an Đẩu Quân, chỉ thay mốc Thái Tuế bằng cung tiểu hạn.
 */
export function anCungThangGieng(tieuHan: number, lunarMonth: number, hourChi: number): number {
  return mod12(tieuHan - (lunarMonth - 1) + hourChi);
}

/**
 * Nhãn tháng của cả mười hai cung, chỉ số 1–12 theo chi. Trả mảng theo chi chứ không theo thứ tự
 * tháng để khớp cách các tầng khác đánh chỉ số.
 */
export function anCungThang(cungThangGieng: number): readonly number[] {
  return Array.from(
    { length: CHI_COUNT },
    (_, chiIndex) => (mod12(chiIndex - cungThangGieng) % MONTH_COUNT) + 1,
  );
}
