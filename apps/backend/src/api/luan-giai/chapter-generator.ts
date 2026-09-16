import type { LuanGiaiArticle } from '@org/shared-contracts';
import type { NatalChart } from '@org/shared-tu-vi';

export interface ChapterResult {
  readonly article: LuanGiaiArticle;
  /** Model nào viết ra bài và tổng số lượt phải sinh lại — theo dõi để thấy prompt xuống cấp sớm. */
  readonly model: string;
  readonly attempts: number;
}

/**
 * Mỗi chương một generator, tra theo số thứ tự chương. Trả `null` nghĩa là bảng luận chưa dựng nổi
 * bài cho lá số này, khác với việc sinh bài hỏng.
 */
export interface ChapterGenerator {
  /**
   * Bảng luận có dựng nổi bài cho lá số này không. Phép tính thuần, không gọi mô hình — hỏi trước
   * để khỏi trừ suất của người dùng cho một việc chắc chắn không ra bài.
   */
  coTheSinh(chart: NatalChart): boolean;
  generate(chart: NatalChart, budgetMs: number): Promise<ChapterResult | null>;
}
