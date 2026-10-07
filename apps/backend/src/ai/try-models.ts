import { readableReason } from './ai-error-reason';
import { AiUnavailableError, type ModelAttempt } from './ai.errors';

/**
 * Gọi lần lượt từng model cho tới khi có model trả kết quả.
 *
 * Fallback ở đây là điều kiện để chạy được chứ không phải tuỳ chọn: gói free của Google mở rất hẹp
 * và thay đổi liên tục — đo lúc dựng thì trong năm model thử, tầng pro trả hạn mức bằng 0 còn hai
 * model flash mới nhất trả UNAVAILABLE vì quá tải.
 */
export async function tryModels<T>(
  models: readonly string[],
  call: (model: string) => Promise<T>,
  /** Hết ngân sách thời gian thì dừng hẳn: thử model kế tiếp cũng chỉ hỏng ngay lập tức. */
  shouldStop?: () => boolean,
): Promise<{
  readonly result: T;
  readonly model: string;
  readonly failedAttempts: readonly ModelAttempt[];
}> {
  const attempts: ModelAttempt[] = [];

  for (const model of models) {
    if (shouldStop?.()) break;
    try {
      return { result: await call(model), model, failedAttempts: attempts };
    } catch (error) {
      attempts.push({ model, reason: readableReason(error) });
    }
  }

  throw new AiUnavailableError(attempts);
}
