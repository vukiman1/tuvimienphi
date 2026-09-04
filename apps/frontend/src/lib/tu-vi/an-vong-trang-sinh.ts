import { CHI_COUNT, mod12 } from '@/lib/tu-vi/chi';
import {
  CHINH_TINH_RATINGS,
  PHU_TINH_RATINGS,
  CHU_MENH_BY_YEAR_CHI,
  CHU_THAN_BY_YEAR_CHI,
  TRANG_SINH_START,
  VONG_TRANG_SINH,
} from '@/lib/tu-vi/bang-tra-data';
import type { ChinhTinhName, PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { Rating } from '@/lib/tu-vi/sao-rating';

/**
 * Vòng Tràng Sinh khởi ở cung do số cục quyết định, rồi đi theo chiều âm dương nam nữ — cùng chiều
 * với vòng Bác Sĩ, nên hai người sinh cùng giờ khác giới có vòng chạy ngược nhau.
 */
export function anVongTrangSinh(cuc: number, isForward: boolean): readonly string[] {
  const start = TRANG_SINH_START[cuc];
  const step = isForward ? 1 : -1;
  const byChi = new Array<string>(CHI_COUNT);

  VONG_TRANG_SINH.forEach((name, index) => {
    byChi[mod12(start + index * step)] = name;
  });

  return byChi;
}

export function chuMenhOf(yearChi: number): string {
  return CHU_MENH_BY_YEAR_CHI[yearChi];
}

export function chuThanOf(yearChi: number): string {
  return CHU_THAN_BY_YEAR_CHI[yearChi];
}

/** Miếu vượng của một chính tinh tại một cung; `null` khi bảng chưa có chứng cho ô đó. */
export function ratingOf(star: ChinhTinhName, chiIndex: number): Rating | null {
  return CHINH_TINH_RATINGS[star][chiIndex];
}

/**
 * Miếu vượng của phụ tinh. Chỉ mười bốn sao có bậc; những sao khác luôn trả `null`, và bản thân
 * `null` cũng là câu trả lời đúng cho phần lớn ô — xem ghi chú ở `PHU_TINH_RATINGS`.
 */
export function phuTinhRatingOf(name: PhuTinhName, chiIndex: number): Rating | null {
  return PHU_TINH_RATINGS[name]?.[chiIndex] ?? null;
}
