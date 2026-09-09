import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiArticle } from '@org/shared-contracts';
import { buildThanCuBrief, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleThanCuArticle } from './assemble-than-cu-article';
import {
  ChapterRejectedError,
  ChapterTimedOutError,
  MalformedChapterError,
} from './luan-giai.errors';
import { THAN_CU_SCHEMA, type ThanCuParagraphs } from './prompt/chapter-schema';
import { buildThanCuMessages, THAN_CU_SYSTEM_PROMPT } from './prompt/than-cu-prompt';
import { checkParagraphs } from './validate/check-paragraphs';

/**
 * Đo trên hai mươi lá số: trung bình 2,0 lượt, và ba lượt vẫn để lọt hai bài hỏng hẳn. Độ trễ ở đây
 * gần như không mất gì — người dùng chờ vài giây cho một bài luận giải là hợp lý, còn nhận 503 thì
 * không — nên nới trần lượt thay vì nới bộ kiểm.
 */
const MAX_ATTEMPTS = 5;

/**
 * Dưới ngần này thì đừng gọi thêm lượt nữa. Một lượt đạt mất 1,5–2,2 giây, nhưng có lần model trả
 * UNAVAILABLE sau 27 giây — đủ để một mình nó ăn hết trần của hàm serverless.
 */
const MIN_ATTEMPT_MS = 4_000;

function isParagraphs(value: unknown): value is ThanCuParagraphs {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.doan1 === 'string' && typeof record.doan2 === 'string';
}

function parseParagraphs(text: string): ThanCuParagraphs {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new MalformedChapterError(text);
  }
  if (!isParagraphs(raw)) throw new MalformedChapterError(text);
  return { doan1: raw.doan1, doan2: raw.doan2 };
}

export interface ThanCuResult {
  readonly article: LuanGiaiArticle;
  /** Model nào viết ra bài và phải sinh lại mấy lần — lưu lại để theo dõi prompt xuống cấp. */
  readonly model: string;
  readonly attempts: number;
}

@Injectable()
export class ThanCuGenerator {
  private readonly logger = new Logger(ThanCuGenerator.name);

  constructor(private readonly ai: AiClient) {}

  /**
   * Trả `null` khi bảng luận chưa soạn tới lá số này — chờ thêm cũng không có bài, nên gọi bên phải
   * phân biệt với trường hợp đang sinh.
   */
  async generate(chart: NatalChart, budgetMs: number): Promise<ThanCuResult | null> {
    const brief = buildThanCuBrief(chart);
    if (!brief) return null;

    const daThu: { paragraphs: ThanCuParagraphs; loi: readonly string[] }[] = [];
    const deadline = Date.now() + budgetMs;

    for (let lan = 1; lan <= MAX_ATTEMPTS; lan += 1) {
      const conLai = deadline - Date.now();
      if (conLai < MIN_ATTEMPT_MS) {
        throw new ChapterTimedOutError(lan - 1, daThu[daThu.length - 1]?.loi ?? []);
      }

      const result = await this.ai.generate({
        system: THAN_CU_SYSTEM_PROMPT,
        messages: buildThanCuMessages(brief, daThu),
        schema: THAN_CU_SCHEMA,
        signal: AbortSignal.timeout(conLai),
      });
      const paragraphs = parseParagraphs(result.text);
      const loi = checkParagraphs(brief, paragraphs, lan < MAX_ATTEMPTS);

      if (loi.length === 0) {
        return {
          article: assembleThanCuArticle(brief, paragraphs),
          model: result.model,
          attempts: lan,
        };
      }

      this.logger.warn(`lần ${lan} bị bộ kiểm chặn (${result.model}): ${loi.join('; ')}`);
      daThu.push({ paragraphs, loi });
    }

    throw new ChapterRejectedError(MAX_ATTEMPTS, daThu[daThu.length - 1].loi);
  }
}
