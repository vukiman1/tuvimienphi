import type { ChinhTinhName, PhuTinhName } from '../sao-names.js';
import type { Rating } from '../sao-rating.js';
import type { LuanDe } from './luan-de.js';
import type { AnNgu, TheChieu } from './the-cung.js';
import type { Gender } from '../van-han.js';

export interface SaoTrongBai {
  readonly ten: PhuTinhName;
  readonly the: TheChieu;
}

/**
 * Phần lá số mà mọi chương đều cần và năm tầng kiểm đều đọc. Chương nào cần thêm dữ kiện riêng thì
 * mở rộng kiểu này, đừng nới nó ra cho vừa một chương.
 */
export interface ChapterBrief {
  /** Cung bài đang luận — quyết định cách gọi vị trí trong bài, ví dụ "thủ mệnh" chỉ đúng ở Mệnh. */
  readonly cung: string;
  readonly chi: string;
  readonly gioiTinh: Gender;
  readonly chiNamSinh: string;
  readonly chinhTinh: readonly { readonly ten: ChinhTinhName; readonly bac: Rating | null }[];
  readonly laVoChinhDieu: boolean;
  readonly hungTinh: readonly SaoTrongBai[];
  readonly catTinh: readonly SaoTrongBai[];
  readonly anNgu: AnNgu;
  readonly luan: readonly LuanDe[];
}

/**
 * Một mục con nối sau hai đoạn chính. Mang nguyên phần lá số của brief chính để năm tầng kiểm chạy
 * y nguyên trên mục, chỉ khác `luan` và có thêm dữ kiện riêng.
 */
export interface MucExtras<K extends string = string> {
  /** Khoá mục, cũng là slug hiện trên thẻ mục con. */
  readonly muc: K;
  readonly tieuDe: string;
  /** Cung mà mục này đọc từ đó, hiện lên thẻ mục con — xem `LuanGiaiSection.sourceCung`. */
  readonly sourceCung: string;
  /** Dữ kiện cụ thể bài BẮT BUỘC phải dẫn, ví dụ mốc tuổi đại vận hay tên cục. */
  readonly duKien: readonly string[];
}

export type ChapterMucBrief = ChapterBrief & MucExtras;
