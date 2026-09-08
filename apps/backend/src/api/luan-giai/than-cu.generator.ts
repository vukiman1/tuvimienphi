import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiArticle } from '@org/shared-contracts';
import { buildThanCuBrief, type NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleThanCuArticle } from './assemble-than-cu-article';
import { ChapterRejectedError, MalformedChapterError } from './luan-giai.errors';
import { THAN_CU_SCHEMA, type ThanCuParagraphs } from './prompt/chapter-schema';
import { buildThanCuMessages, THAN_CU_SYSTEM_PROMPT } from './prompt/than-cu-prompt';
import { checkParagraphs } from './validate/check-paragraphs';

/** Đo lúc dựng: bản đạt thường rơi vào lần một hoặc lần hai, chưa lần nào cần quá ba. */
const MAX_ATTEMPTS = 3;

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

@Injectable()
export class ThanCuGenerator {
  private readonly logger = new Logger(ThanCuGenerator.name);

  constructor(private readonly ai: AiClient) {}

  /**
   * Trả `null` khi bảng luận chưa soạn tới lá số này — chờ thêm cũng không có bài, nên gọi bên phải
   * phân biệt với trường hợp đang sinh.
   */
  async generate(chart: NatalChart): Promise<LuanGiaiArticle | null> {
    const brief = buildThanCuBrief(chart);
    if (!brief) return null;

    const daThu: { paragraphs: ThanCuParagraphs; loi: readonly string[] }[] = [];

    for (let lan = 1; lan <= MAX_ATTEMPTS; lan += 1) {
      const result = await this.ai.generate({
        system: THAN_CU_SYSTEM_PROMPT,
        messages: buildThanCuMessages(brief, daThu),
        schema: THAN_CU_SCHEMA,
      });
      const paragraphs = parseParagraphs(result.text);
      const loi = checkParagraphs(brief, paragraphs);

      if (loi.length === 0) {
        return assembleThanCuArticle(brief, paragraphs);
      }

      this.logger.warn(`lần ${lan} bị bộ kiểm chặn (${result.model}): ${loi.join('; ')}`);
      daThu.push({ paragraphs, loi });
    }

    throw new ChapterRejectedError(MAX_ATTEMPTS, daThu[daThu.length - 1].loi);
  }
}
