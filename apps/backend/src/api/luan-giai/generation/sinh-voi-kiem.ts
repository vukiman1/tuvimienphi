import type { AiClient } from '../../../ai/port/ai.client';
import type { AiMessage, AiSchema } from '../../../ai/port/ai.types';
import {
  ChapterRejectedError,
  ChapterTimedOutError,
  MalformedChapterError,
} from '../luan-giai.errors';

export const MAX_ATTEMPTS = 5;

const MIN_ATTEMPT_MS = 4_000;

export interface KetSinh<T> {
  readonly value: T;
  readonly model: string;
  readonly attempts: number;
}

export interface LanThu<T> {
  readonly paragraph: T;
  readonly loi: readonly string[];
}

export interface CachSinh<T> {
  readonly system: string;
  readonly schema: AiSchema;
  readonly messages: (daThu: readonly LanThu<T>[]) => AiMessage[];
  readonly parse: (text: string) => T;
  readonly check: (value: T, conLuotDeSinhLai: boolean) => readonly string[];
}

export async function sinhVoiKiem<T>(
  ai: AiClient,
  cach: CachSinh<T>,
  budgetMs: number,
  onReject?: (lan: number, model: string, loi: readonly string[]) => void,
  beforeAttempt?: () => Promise<void>,
): Promise<KetSinh<T>> {
  const daThu: LanThu<T>[] = [];
  let deadline = Date.now() + budgetMs;

  for (let lan = 1; lan <= MAX_ATTEMPTS; lan += 1) {
    const pauseStartedAt = Date.now();
    await beforeAttempt?.();
    deadline += Date.now() - pauseStartedAt;

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

    const loi = cach.check(paragraph, lan < MAX_ATTEMPTS);
    if (loi.length === 0) {
      return { value: paragraph, model: result.model, attempts: lan };
    }

    onReject?.(lan, result.model, loi);
    daThu.push({ paragraph, loi });
  }

  throw new ChapterRejectedError(MAX_ATTEMPTS, daThu[daThu.length - 1]?.loi ?? []);
}
