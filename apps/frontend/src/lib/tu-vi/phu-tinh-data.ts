import type { PhuTinhName } from '@/lib/tu-vi/sao-names';

/**
 * Bảng an phụ tinh: mỗi bảng cho biết sao rơi vào chi nào ứng với từng giá trị tham số.
 *
 * Số liệu suy ra từ 33 lá số lấy trên tuvi.vn, phủ đủ 10 can năm, 12 chi năm, 12 tháng âm và 12 giờ
 * sinh — nghĩa là mỗi ô trong bảng đều có ít nhất một lá số làm chứng, không ô nào suy diễn.
 * `cast-chart.cross.spec.ts` đối chiếu ngược lại toàn bộ.
 *
 * Đây là dữ liệu tra cứu chứ không phải công thức: phần lớn phụ tinh không tính ra được bằng một
 * phép cộng đều, nên chép bảng là cách trung thực nhất.
 */

export enum PhuTinhKey {
  YearCan = 'yearCan',
  YearChi = 'yearChi',
  /** Tháng âm, 1–12. */
  Month = 'month',
  HourChi = 'hourChi',
}

export interface PhuTinhRule {
  readonly name: PhuTinhName;
  readonly key: PhuTinhKey;
  /** Chi của sao, xếp theo giá trị tham số tăng dần. */
  readonly byValue: readonly number[];
}

export const PHU_TINH_RULES: readonly PhuTinhRule[] = [
  // An theo can năm (16 sao).
  { name: 'Bác Sỹ', key: PhuTinhKey.YearCan, byValue: [2, 3, 5, 6, 5, 6, 8, 9, 11, 0] },
  { name: 'Kình Dương', key: PhuTinhKey.YearCan, byValue: [3, 4, 6, 7, 6, 7, 9, 10, 0, 1] },
  { name: 'Lưu Hà', key: PhuTinhKey.YearCan, byValue: [9, 10, 7, 8, 5, 6, 4, 3, 11, 2] },
  { name: 'Lộc Tồn', key: PhuTinhKey.YearCan, byValue: [2, 3, 5, 6, 5, 6, 8, 9, 11, 0] },
  { name: 'Phi Liêm', key: PhuTinhKey.YearCan, byValue: [8, 9, 11, 0, 11, 0, 2, 3, 5, 6] },
  { name: 'Quốc Ấn', key: PhuTinhKey.YearCan, byValue: [10, 11, 1, 2, 1, 2, 4, 5, 7, 8] },
  { name: 'Thiên Khôi', key: PhuTinhKey.YearCan, byValue: [1, 0, 11, 11, 1, 0, 6, 6, 3, 3] },
  { name: 'Thiên La', key: PhuTinhKey.YearCan, byValue: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
  { name: 'Thiên Phúc', key: PhuTinhKey.YearCan, byValue: [9, 8, 0, 11, 3, 2, 6, 5, 6, 5] },
  { name: 'Thiên Quan', key: PhuTinhKey.YearCan, byValue: [7, 4, 5, 2, 3, 9, 11, 9, 10, 6] },
  { name: 'Thiên Trù', key: PhuTinhKey.YearCan, byValue: [5, 6, 0, 5, 6, 8, 2, 6, 9, 10] },
  { name: 'Thiên Việt', key: PhuTinhKey.YearCan, byValue: [7, 8, 9, 9, 7, 8, 2, 2, 5, 5] },
  { name: 'Văn Tinh', key: PhuTinhKey.YearCan, byValue: [5, 6, 8, 9, 8, 9, 11, 0, 9, 3] },
  { name: 'Đà La', key: PhuTinhKey.YearCan, byValue: [1, 2, 4, 5, 4, 5, 7, 8, 10, 11] },
  { name: 'Đường Phù', key: PhuTinhKey.YearCan, byValue: [7, 8, 10, 11, 10, 11, 1, 2, 4, 5] },
  { name: 'Địa Võng', key: PhuTinhKey.YearCan, byValue: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10] },
  // An theo chi năm (29 sao).
  { name: 'Bạch Hổ', key: PhuTinhKey.YearChi, byValue: [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7] },
  { name: 'Cô Thần', key: PhuTinhKey.YearChi, byValue: [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2] },
  { name: 'Giải Thần', key: PhuTinhKey.YearChi, byValue: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11] },
  { name: 'Hoa Cái', key: PhuTinhKey.YearChi, byValue: [4, 1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7] },
  { name: 'Hồng Loan', key: PhuTinhKey.YearChi, byValue: [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4] },
  { name: 'Kiếp Sát', key: PhuTinhKey.YearChi, byValue: [5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8] },
  { name: 'Long Trì', key: PhuTinhKey.YearChi, byValue: [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3] },
  { name: 'Long Đức', key: PhuTinhKey.YearChi, byValue: [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6] },
  { name: 'Nguyệt Đức', key: PhuTinhKey.YearChi, byValue: [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4] },
  { name: 'Phá Toái', key: PhuTinhKey.YearChi, byValue: [5, 1, 9, 5, 1, 9, 5, 1, 9, 5, 1, 9] },
  { name: 'Phúc Đức', key: PhuTinhKey.YearChi, byValue: [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { name: 'Phượng Các', key: PhuTinhKey.YearChi, byValue: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11] },
  { name: 'Quan Phù', key: PhuTinhKey.YearChi, byValue: [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3] },
  { name: 'Quả Tú', key: PhuTinhKey.YearChi, byValue: [10, 10, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10] },
  { name: 'Tang Môn', key: PhuTinhKey.YearChi, byValue: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1] },
  { name: 'Thiên Hư', key: PhuTinhKey.YearChi, byValue: [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5] },
  { name: 'Thiên Hỉ', key: PhuTinhKey.YearChi, byValue: [9, 8, 7, 6, 0, 4, 3, 2, 1, 0, 11, 10] },
  { name: 'Thiên Không', key: PhuTinhKey.YearChi, byValue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] },
  { name: 'Thiên Khốc', key: PhuTinhKey.YearChi, byValue: [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7] },
  { name: 'Thiên Mã', key: PhuTinhKey.YearChi, byValue: [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5] },
  { name: 'Thiên Đức', key: PhuTinhKey.YearChi, byValue: [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { name: 'Thiếu Dương', key: PhuTinhKey.YearChi, byValue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] },
  { name: 'Thiếu Âm', key: PhuTinhKey.YearChi, byValue: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2] },
  { name: 'Thái Tuế', key: PhuTinhKey.YearChi, byValue: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { name: 'Trực Phù', key: PhuTinhKey.YearChi, byValue: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { name: 'Tuế Phá', key: PhuTinhKey.YearChi, byValue: [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5] },
  { name: 'Tử Phù', key: PhuTinhKey.YearChi, byValue: [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4] },
  { name: 'Điếu Khách', key: PhuTinhKey.YearChi, byValue: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { name: 'Đào Hoa', key: PhuTinhKey.YearChi, byValue: [9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0] },
  // An theo tháng âm (7 sao).
  { name: 'Hữu Bật', key: PhuTinhKey.Month, byValue: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11] },
  { name: 'Thiên Diêu', key: PhuTinhKey.Month, byValue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] },
  { name: 'Thiên Giải', key: PhuTinhKey.Month, byValue: [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7] },
  { name: 'Thiên Hình', key: PhuTinhKey.Month, byValue: [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { name: 'Thiên Y', key: PhuTinhKey.Month, byValue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] },
  { name: 'Tả Phù', key: PhuTinhKey.Month, byValue: [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3] },
  { name: 'Địa Giải', key: PhuTinhKey.Month, byValue: [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6] },
  // An theo giờ sinh (6 sao).
  { name: 'Phong Cáo', key: PhuTinhKey.HourChi, byValue: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1] },
  { name: 'Thai Phụ', key: PhuTinhKey.HourChi, byValue: [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5] },
  { name: 'Văn Khúc', key: PhuTinhKey.HourChi, byValue: [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3] },
  { name: 'Văn Xương', key: PhuTinhKey.HourChi, byValue: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11] },
  { name: 'Địa Không', key: PhuTinhKey.HourChi, byValue: [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] },
  { name: 'Địa Kiếp', key: PhuTinhKey.HourChi, byValue: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
];
