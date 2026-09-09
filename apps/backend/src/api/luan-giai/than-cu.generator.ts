import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import {
  buildMucBriefs,
  buildThanCuBrief,
  type MucBrief,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleThanCuArticle } from './assemble-than-cu-article';
import {
  MUC_SCHEMA,
  THAN_CU_SCHEMA,
  type MucParagraph,
  type ThanCuParagraphs,
} from './prompt/chapter-schema';
import { buildMucMessages, MUC_SYSTEM_PROMPT } from './prompt/muc-prompt';
import { buildThanCuMessages, THAN_CU_SYSTEM_PROMPT } from './prompt/than-cu-prompt';
import { sinhVoiKiem } from './sinh-voi-kiem';
import { baiChinh, baiMuc } from './validate/to-bai';

export interface ThanCuResult {
  readonly article: LuanGiaiArticle;
  /** Model nào viết ra bài và tổng số lượt phải sinh lại — theo dõi để thấy prompt xuống cấp sớm. */
  readonly model: string;
  readonly attempts: number;
}

function parse<T>(text: string, coDu: (value: Record<string, unknown>) => boolean): T {
  const raw: unknown = JSON.parse(text);
  if (typeof raw !== 'object' || raw === null || !coDu(raw as Record<string, unknown>)) {
    throw new Error('shape');
  }
  return raw as T;
}

@Injectable()
export class ThanCuGenerator {
  private readonly logger = new Logger(ThanCuGenerator.name);

  constructor(private readonly ai: AiClient) {}

  /**
   * Trả `null` khi bảng luận chưa dựng nổi brief — bên gọi cần phân biệt với trường hợp đang sinh.
   *
   * Hai đoạn chính và từng mục con chạy SONG SONG: chúng độc lập nhau nên chờ tuần tự chỉ tổ nhân
   * thời gian lên gấp bốn mà không được gì. Đoạn chính bắt buộc phải xong; mục con nào hỏng thì bỏ
   * mục đó, vì bài thiếu một mục vẫn hơn là không có bài.
   */
  async generate(chart: NatalChart, budgetMs: number): Promise<ThanCuResult | null> {
    const brief = buildThanCuBrief(chart);
    if (!brief) return null;

    const mucBriefs = buildMucBriefs(chart);

    const [chinh, ...mucs] = await Promise.all([
      sinhVoiKiem<ThanCuParagraphs>(
        this.ai,
        {
          brief,
          system: THAN_CU_SYSTEM_PROMPT,
          schema: THAN_CU_SCHEMA,
          messages: (daThu) =>
            buildThanCuMessages(
              brief,
              daThu.map((lan) => ({ paragraphs: lan.paragraph, loi: lan.loi })),
            ),
          parse: (text) =>
            parse<ThanCuParagraphs>(
              text,
              (o) => typeof o.doan1 === 'string' && typeof o.doan2 === 'string',
            ),
          toBai: baiChinh,
        },
        budgetMs,
        (lan, model, loi) =>
          this.logger.warn(`bài chính lần ${lan} bị chặn (${model}): ${loi.join('; ')}`),
      ),
      ...mucBriefs.map((mucBrief) => this.sinhMuc(mucBrief, budgetMs)),
    ]);

    const sections = mucs.filter((muc): muc is LuanGiaiSection => muc !== null);
    const tongLuot = chinh.attempts;

    return {
      article: assembleThanCuArticle(brief, chinh.value, sections),
      model: chinh.model,
      attempts: tongLuot,
    };
  }

  private async sinhMuc(brief: MucBrief, budgetMs: number): Promise<LuanGiaiSection | null> {
    try {
      const ket = await sinhVoiKiem<MucParagraph>(
        this.ai,
        {
          brief,
          system: MUC_SYSTEM_PROMPT,
          schema: MUC_SCHEMA,
          messages: (daThu) => buildMucMessages(brief, daThu),
          parse: (text) => parse<MucParagraph>(text, (o) => typeof o.doan === 'string'),
          toBai: baiMuc,
        },
        budgetMs,
      );
      return {
        slug: brief.muc,
        title: brief.tieuDe,
        sourceCung: brief.sourceCung,
        paragraphs: [ket.value.doan],
      };
    } catch (error) {
      // Bỏ mục hỏng chứ không kéo cả bài xuống: mục con là phần thêm, hai đoạn chính mới là bài.
      this.logger.warn(`bỏ mục "${brief.tieuDe}": ${(error as Error).message.slice(0, 140)}`);
      return null;
    }
  }
}
