/** Chương 01 là Thân cư. Năm chương còn lại chưa có bảng luận nên chưa nhận yêu cầu sinh. */
export const CHAPTER_THAN_CU = '01';
export const SUPPORTED_CHAPTERS = [CHAPTER_THAN_CU] as const;

/**
 * Mỗi lượt sinh là một lần gọi API mất tiền, và người dùng gõ ngày sinh bất kỳ cũng kích hoạt được.
 * Ba chương một ngày đủ cho một người xem kỹ lá số của mình mà không quét được nhiều lá số lạ.
 */
export const DAILY_CHAPTER_QUOTA = 3;
export const QUOTA_WINDOW_SECONDS = 24 * 60 * 60;

/**
 * Trần thời gian cho một lượt sinh. Hàm serverless của Vercel bị cắt ở 30 giây, nên chừa lại tám
 * giây cho cold start, truy vấn database và serialize — sinh không kịp thì báo bận, đừng để Vercel
 * cắt ngang giữa chừng và trả về một lỗi không nói lên điều gì.
 */
export const GENERATION_BUDGET_MS = 22_000;
