import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiSection } from '@org/shared-contracts';
import {
  buildMenhBrief,
  buildMenhMucBriefs,
  type MenhMucBrief,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleMenhArticle } from './assemble-menh-article';
import type { ChapterResult } from './chapter-generator';
import {
  MUC_SCHEMA,
  THAN_CU_SCHEMA,
  type MucParagraph,
  type ThanCuParagraphs,
} from './prompt/chapter-schema';
import { buildMenhMessages, MENH_SYSTEM_PROMPT } from './prompt/menh-prompt';
import { buildMucMessages, mucSystemPrompt } from './prompt/muc-prompt';
import { sinhVoiKiem } from './sinh-voi-kiem';
import { baiChinh, baiMuc } from './validate/to-bai';

function parseMuc(text: string): MucParagraph {
  const raw: unknown = JSON.parse(text);
  if (typeof raw !== 'object' || raw === null || typeof (raw as MucParagraph).doan !== 'string') {
    throw new Error('shape');
  }
  return raw as MucParagraph;
}

function parse(text: string): ThanCuParagraphs {
  const raw: unknown = JSON.parse(text);
  if (
    typeof raw !== 'object' ||
    raw === null ||
    typeof (raw as ThanCuParagraphs).doan1 !== 'string' ||
    typeof (raw as ThanCuParagraphs).doan2 !== 'string'
  ) {
    throw new Error('shape');
  }
  return raw as ThanCuParagraphs;
}

@Injectable()
export class MenhGenerator {
  private readonly logger = new Logger(MenhGenerator.name);

  constructor(private readonly ai: AiClient) {}

  coTheSinh(chart: NatalChart): boolean {
    return buildMenhBrief(chart) !== null;
  }

  /** Trả `null` khi bảng luận chưa dựng nổi brief — bên gọi phân biệt với trường hợp đang sinh. */
  async generate(chart: NatalChart, budgetMs: number): Promise<ChapterResult | null> {
    const brief = buildMenhBrief(chart);
    if (!brief) return null;

    const mucBriefs = buildMenhMucBriefs(chart);

    // Bài chính và từng mục chạy SONG SONG: chúng độc lập nhau nên chờ tuần tự chỉ tổ nhân thời
    // gian lên mà không được gì. Mục nào hỏng thì bỏ mục đó, bài thiếu một mục vẫn hơn không có bài.
    const [chinh, ...mucs] = await Promise.all([
      sinhVoiKiem<ThanCuParagraphs>(
        this.ai,
        {
          brief,
          system: MENH_SYSTEM_PROMPT,
          schema: THAN_CU_SCHEMA,
          messages: (daThu) =>
            buildMenhMessages(
              brief,
              daThu.map((lan) => ({ paragraphs: lan.paragraph, loi: lan.loi })),
            ),
          parse,
          toBai: baiChinh,
        },
        budgetMs,
        (lan, model, loi) =>
          this.logger.warn(`bài chính lần ${lan} bị chặn (${model}): ${loi.join('; ')}`),
      ),
      ...mucBriefs.map((mucBrief) => this.sinhMuc(mucBrief, budgetMs)),
    ]);

    const sections = mucs.filter((muc): muc is LuanGiaiSection => muc !== null);

    return {
      article: assembleMenhArticle(brief, chinh.value, sections),
      model: chinh.model,
      attempts: chinh.attempts,
    };
  }

  private async sinhMuc(brief: MenhMucBrief, budgetMs: number): Promise<LuanGiaiSection | null> {
    try {
      const ket = await sinhVoiKiem<MucParagraph>(
        this.ai,
        {
          brief,
          system: mucSystemPrompt(brief.cung),
          schema: MUC_SCHEMA,
          messages: (daThu) => buildMucMessages(brief, daThu),
          parse: parseMuc,
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
