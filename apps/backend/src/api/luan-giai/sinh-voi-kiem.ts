import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { AiClient } from '../../ai/ai.client';
import type { AiMessage, AiSchema } from '../../ai/ai.types';
import {
  ChapterRejectedError,
  ChapterTimedOutError,
  MalformedChapterError,
} from './luan-giai.errors';
import type { BaiCanKiem } from './validate/bai-can-kiem';
import { checkParagraphs } from './validate/check-paragraphs';

/** Đo trên hai mươi lá số: trung bình 2,2 lượt, mà ba lượt vẫn để lọt. */
export const MAX_ATTEMPTS = 5;

/**
 * Dưới ngần này thì đừng gọi thêm lượt nữa. Một lượt đạt mất 1,5–2,2 giây, nhưng gói free có lúc
 * trả lời sau hơn hai mươi giây — đủ để một mình nó ăn hết trần của hàm serverless.
 */
const MIN_ATTEMPT_MS = 4_000;

export interface KetSinh<T> {
  readonly value: T;
  readonly model: string;
  readonly attempts: number;
}

export interface CachSinh<T> {
  readonly brief: ThanCuBrief;
  readonly system: string;
  readonly schema: AiSchema;
  readonly messages: (daThu: readonly { paragraph: T; loi: readonly string[] }[]) => AiMessage[];
  readonly parse: (text: string) => T;
  readonly toBai: (value: T) => BaiCanKiem;
}

/**
 * Một vòng sinh–kiểm–sinh lại, dùng chung cho hai đoạn chính và cho từng mục con. Tách ra vì cả hai
 * chạy y hệt nhau, chỉ khác prompt, khác hình dạng trả về và khác cách xếp đoạn cho bộ kiểm.
 */
export async function sinhVoiKiem<T>(
  ai: AiClient,
  cach: CachSinh<T>,
  budgetMs: number,
  onReject?: (lan: number, model: string, loi: readonly string[]) => void,
): Promise<KetSinh<T>> {
  const daThu: { paragraph: T; loi: readonly string[] }[] = [];
  const deadline = Date.now() + budgetMs;

  for (let lan = 1; lan <= MAX_ATTEMPTS; lan += 1) {
    const conLai = deadline - Date.now();
    if (conLai < MIN_ATTEMPT_MS) {
      throw new ChapterTimedOutError(lan - 1, daThu[daThu.length - 1]?.loi ?? []);
    }

    const result = await ai.generate({
      system: cach.system,
      messages: cach.messages(daThu),
      schema: cach.schema,
      signal: AbortSignal.timeout(conLai),
    });

    let paragraph: T;
    try {
      paragraph = cach.parse(result.text);
    } catch {
      throw new MalformedChapterError(result.text);
    }

    const loi = checkParagraphs(cach.brief, cach.toBai(paragraph), lan < MAX_ATTEMPTS);
    if (loi.length === 0) {
      return { value: paragraph, model: result.model, attempts: lan };
    }

    onReject?.(lan, result.model, loi);
    daThu.push({ paragraph, loi });
  }

  throw new ChapterRejectedError(MAX_ATTEMPTS, daThu[daThu.length - 1]?.loi ?? []);
}
