/**
 * Bốn bảng trọng lượng của xưng cốt ca. Đơn vị **chỉ** để mọi phép cộng ở lại số nguyên; một lượng
 * bằng mười chỉ.
 *
 * Bảng chép từ sách rồi kiểm ngược bằng 37 lá số tuvi.vn — khớp toàn bộ. Năm ô lệch so với bản chép
 * đầu đã sửa theo dữ liệu: trụ năm Giáp Tuất, Kỷ Sửu, Quý Hợi, tháng mười và ngày mùng năm.
 *
 * Không suy được bảng chỉ bằng dữ liệu: 114 ô mà chỉ có 37 phương trình. Những ô chưa lá số nào
 * chạm tới vẫn là chép tay, chưa có gì xác nhận.
 */

// reason: xếp mười giá trị một dòng để đối chiếu với bảng in trong sách; Prettier sẽ bẻ mỗi số một dòng.
// prettier-ignore
/** Sáu mươi trụ năm, theo thứ tự lục thập hoa giáp. */
export const CAN_LUONG_YEAR: readonly number[] = [
  12,  9,  6,  7, 12,  5,  9,  8,  7,  8, // Giáp Tý …
   5,  9, 16,  8,  8, 19, 12,  6,  8,  7, // Giáp Tuất …
   5, 15,  6, 16, 15,  8,  9, 12, 10,  7, // Giáp Thân …
  15,  6,  5, 14, 14,  9,  7,  7,  9, 12, // Giáp Ngọ …
   8,  7, 13,  5, 14,  5,  9, 17,  5,  7, // Giáp Thìn …
  12,  8,  8,  6, 19,  6,  8, 16, 10,  7, // Giáp Dần …
];

/** Mười hai tháng âm, tính từ tháng Giêng. */
export const CAN_LUONG_MONTH: readonly number[] = [6, 7, 18, 9, 5, 16, 9, 15, 18, 18, 9, 5];

// prettier-ignore
/** Ba mươi ngày âm, tính từ mùng một. */
export const CAN_LUONG_DAY: readonly number[] = [
   5, 10,  8, 15, 15, 15,  8, 16,  8, 16, // ngày 1–10
   9, 17,  8, 17, 10,  8,  9, 18,  5, 15, // ngày 11–20
  10,  9,  8,  9, 15, 18,  7,  8, 16,  6, // ngày 21–30
];

/** Mười hai giờ, theo chi. */
export const CAN_LUONG_HOUR: readonly number[] = [16, 6, 7, 10, 9, 16, 10, 8, 8, 9, 6, 6];
