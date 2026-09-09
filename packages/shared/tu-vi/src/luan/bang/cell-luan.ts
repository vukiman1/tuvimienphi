import type { ChinhTinhName } from '../../sao-names.js';
import type { Rating } from '../../sao-rating.js';
import { Sac, type LuanDe } from '../luan-de.js';

/**
 * Viết mệnh đề như một MỆNH ĐỀ, không như một câu hoàn chỉnh: bỏ liên từ dẫn ("sao còn vượng nên…",
 * "đắc địa nên…") vì mô hình trích gần như nguyên văn, và một câu văn nhét vào giữa câu khác thì
 * đọc gãy. Bậc miếu vượng đã nằm ở khoá `theoBac` rồi, không cần nhắc lại trong lời.
 *
 * `chung` đúng ở mọi bậc; `theoBac` dành cho những sao mà miếu và hãm luận khác nhau về CHẤT chứ
 * không phải về mức — Thái Dương miếu ở Ngọ là mặt trời giữa trưa, hãm ở Tý là mặt trời nửa đêm.
 */
export interface CellLuan {
  readonly chung: readonly LuanDe[];
  readonly theoBac?: Partial<Record<Rating, readonly LuanDe[]>>;
}

const TRONG_THUAN = 85;
const TRONG_NGHICH = 78;

type MotY = readonly [y: string, ...tuKhoa: string[]];

/**
 * Dựng một ô bảng từ hai mệnh đề tối thiểu mà bài nào cũng cần: một thuận cho đoạn mở, một nghịch
 * cho đoạn sau. Phần tử đầu là mệnh đề, các phần tử sau là từ khoá bắt buộc xuất hiện trong bài.
 *
 * Viết dạng này để bảng đọc được như một lưới — người soát tử vi cần thấy ngay "sao này ở cung này
 * luận thuận gì, nghịch gì", không phải lần qua tám dòng object cho mỗi mệnh đề.
 */
export function cell(sao: ChinhTinhName, thuan: MotY, nghich: MotY): CellLuan {
  const [yThuan, ...tuKhoaThuan] = thuan;
  const [yNghich, ...tuKhoaNghich] = nghich;
  return {
    chung: [
      { y: yThuan, do: [sao], sac: Sac.Thuan, trong: TRONG_THUAN, tuKhoa: tuKhoaThuan },
      { y: yNghich, do: [sao], sac: Sac.Nghich, trong: TRONG_NGHICH, tuKhoa: tuKhoaNghich },
    ],
  };
}
