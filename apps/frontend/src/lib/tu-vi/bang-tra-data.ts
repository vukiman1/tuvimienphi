import type { ChinhTinhName, PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { Rating } from '@/lib/tu-vi/sao-rating';

/**
 * Ba bảng tra còn lại của lá số, suy từ 33 lá số trên tuvi.vn giống các bảng phụ tinh.
 *
 * Miếu vượng đắc bình hãm chưa phủ hết: 33 lá số chạm tới 154 trong 168 ô của bảng 14 chính tinh ×
 * 12 cung. Ô chưa có chứng thì để `null` và giao diện không in gì, thay vì đoán một mức.
 */

/** Mười hai sao vòng Tràng Sinh, xếp theo đúng thứ tự đi vòng. */
export const VONG_TRANG_SINH = [
  'Tràng Sinh',
  'Mộc Dục',
  'Quan Đới',
  'Lâm Quan',
  'Đế Vượng',
  'Suy',
  'Bệnh',
  'Tử',
  'Mộ',
  'Tuyệt',
  'Thai',
  'Dưỡng',
] as const;

/** Cung khởi Tràng Sinh, tra theo số cục. */
export const TRANG_SINH_START: Readonly<Record<number, number>> = {
  2: 8,
  3: 11,
  4: 5,
  5: 8,
  6: 2,
};

/** Chủ mệnh và chủ thân, tra theo chi năm sinh. */
export const CHU_MENH_BY_YEAR_CHI = [
  'Tham Lang', // Tý
  'Cự Môn', // Sửu
  'Lộc Tồn', // Dần
  'Văn Khúc', // Mão
  'Liêm Trinh', // Thìn
  'Vũ Khúc', // Tị
  'Phá Quân', // Ngọ
  'Vũ Khúc', // Mùi
  'Liêm Trinh', // Thân
  'Văn Khúc', // Dậu
  'Lộc Tồn', // Tuất
  'Cự Môn', // Hợi
] as const;

export const CHU_THAN_BY_YEAR_CHI = [
  'Linh Tinh', // Tý
  'Thiên Tướng', // Sửu
  'Thiên Lương', // Dần
  'Thiên Đồng', // Mão
  'Văn Xương', // Thìn
  'Thiên Cơ', // Tị
  'Hỏa Tinh', // Ngọ
  'Thiên Tướng', // Mùi
  'Thiên Lương', // Thân
  'Thiên Đồng', // Dậu
  'Văn Xương', // Tuất
  'Thiên Cơ', // Hợi
] as const;

/** Miếu (M) / Vượng (V) / Đắc (Đ) / Bình (B) / Hãm (H) của chính tinh tại từng cung. */
export const CHINH_TINH_RATINGS: Readonly<Record<ChinhTinhName, ReadonlyArray<Rating | null>>> = {
  'Tử Vi': [null, 'Đ', 'M', 'B', 'V', 'M', 'M', 'Đ', 'M', 'B', 'V', 'B'],
  'Thiên Cơ': ['Đ', 'Đ', 'H', 'M', 'M', 'V', 'Đ', 'Đ', 'V', 'M', 'M', null],
  'Thái Dương': ['H', 'Đ', 'V', 'V', 'V', 'M', 'M', 'Đ', 'H', null, 'H', 'H'],
  'Vũ Khúc': ['V', 'M', 'V', 'Đ', 'M', 'H', 'V', 'M', null, 'Đ', 'M', 'H'],
  'Thiên Đồng': ['V', 'H', 'M', 'Đ', 'H', 'Đ', 'H', null, 'M', 'H', 'H', 'Đ'],
  'Liêm Trinh': ['V', 'Đ', 'V', 'H', null, 'H', 'V', 'Đ', 'V', 'H', 'M', 'H'],
  'Thiên Phủ': ['M', 'B', 'M', 'B', null, 'Đ', 'M', 'Đ', 'M', 'B', 'V', 'Đ'],
  'Thái Âm': ['V', 'Đ', 'H', 'H', 'H', null, 'H', 'Đ', 'V', 'M', 'M', 'M'],
  'Tham Lang': ['H', 'M', 'Đ', 'H', 'V', 'H', null, 'M', 'Đ', 'H', 'V', 'H'],
  'Cự Môn': ['V', 'H', 'V', 'M', 'H', 'H', 'V', null, 'Đ', 'M', 'H', 'Đ'],
  'Thiên Tướng': ['V', 'Đ', 'M', 'H', 'V', 'Đ', 'V', 'Đ', null, 'H', 'V', 'Đ'],
  'Thiên Lương': ['V', 'Đ', 'V', 'V', 'M', 'H', 'M', 'Đ', 'V', null, 'M', 'H'],
  'Thất Sát': ['M', 'Đ', 'M', 'H', 'H', 'V', 'M', 'Đ', 'M', 'H', null, 'V'],
  'Phá Quân': ['M', 'V', null, 'H', 'Đ', 'H', 'M', 'V', 'H', 'H', 'Đ', 'H'],
};

/**
 * Miếu vượng đắc bình hãm của mười bốn phụ tinh có bậc. Dò từ 35 lá số tuvi.vn, không ô nào mâu
 * thuẫn.
 *
 * `null` mang hai nghĩa khác nhau, và phân biệt được nhờ dữ liệu: phần lớn là **trang không in bậc
 * cho ô đó** — Địa Kiếp chỉ có bậc tại Dần, Văn Xương và Văn Khúc bỏ trống Mão với Dậu. Không sao
 * nào vừa có vừa không bậc tại cùng một cung, nên đó là quy ước chứ không phải thiếu dữ liệu.
 *
 * Mọi ô sao có thể tới được đều đã quan sát; không còn ô nào thiếu dữ liệu.
 *
 * Kình Dương, Đà La và Lộc Tồn không bao giờ đóng ở tứ mộ, Thiên Mã chỉ đóng ở tứ sinh — những cung
 * đó `null` vì sao không tới được, không phải vì thiếu bảng.
 */
export const PHU_TINH_RATINGS: Readonly<
  Partial<Record<PhuTinhName, ReadonlyArray<Rating | null>>>
> = {
  'Hỏa Tinh': ['H', 'H', 'Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H'],
  'Kình Dương': ['H', 'Đ', null, 'H', 'Đ', null, 'H', 'Đ', null, 'H', 'Đ', null],
  'Linh Tinh': ['H', 'H', 'Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H'],
  'Lộc Tồn': ['M', null, 'M', 'M', null, null, 'M', null, 'B', 'B', null, null],
  'Thiên Diêu': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H'],
  'Thiên Hình': ['H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H'],
  'Thiên Hư': ['H', 'H', 'H', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
  'Thiên Khốc': ['Đ', null, 'H', 'Đ', 'H', 'H', 'Đ', 'Đ', 'H', 'Đ', 'H', 'H'],
  'Thiên Mã': [null, null, 'Đ', null, null, 'Đ', null, null, 'H', null, null, 'H'],
  'Văn Khúc': ['H', 'Đ', 'H', null, 'Đ', 'Đ', 'H', 'Đ', 'H', null, 'Đ', 'Đ'],
  'Văn Xương': ['H', 'Đ', 'H', null, 'Đ', 'Đ', 'H', 'Đ', 'H', null, 'Đ', 'Đ'],
  'Đà La': [null, 'Đ', 'H', null, 'Đ', 'H', null, 'Đ', 'H', null, 'Đ', 'H'],
  'Địa Không': ['H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
  'Địa Kiếp': [null, null, 'Đ', null, null, null, null, null, null, null, null, null],
};
