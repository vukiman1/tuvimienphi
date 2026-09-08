import type { BirthInput } from '@org/shared-contracts';

/** Chương 01 là Thân cư. Năm chương còn lại chưa có bảng luận nên chưa nhận yêu cầu sinh. */
export const CHAPTER_THAN_CU = '01';
export const SUPPORTED_CHAPTERS = [CHAPTER_THAN_CU] as const;

export const LUAN_GIAI_QUEUE = 'luan-giai';

/**
 * Mỗi lượt sinh là một lần gọi API mất tiền, và người dùng gõ ngày sinh bất kỳ cũng kích hoạt được.
 * Ba chương một ngày đủ cho một người xem kỹ lá số của mình mà không quét được nhiều lá số lạ.
 */
export const DAILY_CHAPTER_QUOTA = 3;
export const QUOTA_WINDOW_SECONDS = 24 * 60 * 60;

export interface GenerateChapterJob {
  readonly birthKey: string;
  readonly order: string;
  /** Đầu vào ngày sinh để worker tự dựng lại lá số; nó không nhận lá số từ đâu khác. */
  readonly birth: BirthInput;
}
