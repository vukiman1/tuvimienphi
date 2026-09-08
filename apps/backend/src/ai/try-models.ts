import { AiUnavailableError, type ModelAttempt } from './ai.errors';

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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
): Promise<{ readonly result: T; readonly model: string }> {
  const attempts: ModelAttempt[] = [];

  for (const model of models) {
    try {
      return { result: await call(model), model };
    } catch (error) {
      attempts.push({ model, reason: reasonOf(error) });
    }
  }

  throw new AiUnavailableError(attempts);
}
