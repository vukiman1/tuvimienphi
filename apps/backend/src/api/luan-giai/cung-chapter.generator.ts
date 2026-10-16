import { Logger } from '@nestjs/common';
import type { LuanGiaiSection } from '@org/shared-contracts';
import type { CungBrief, CungMucBrief, NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleCungArticle } from './assemble-cung-article';
import type { ChapterGenerator, ChapterResult } from './chapter-generator';
import {
  MUC_SCHEMA,
  THAN_CU_SCHEMA,
  type MucParagraph,
  type ThanCuParagraphs,
} from './prompt/chapter-schema';
import { buildCungMessages } from './prompt/cung-prompt';
import type { KhungChuong } from './prompt/khung-chuong';
import { buildMucMessages, mucSystemPrompt } from './prompt/muc-prompt';
import { sinhVoiKiem } from './sinh-voi-kiem';
import { baiChinh, baiMuc } from './validate/to-bai';

export interface CungChapter {
  readonly buildBrief: (chart: NatalChart) => CungBrief | null;
  readonly buildMucBriefs: (chart: NatalChart) => readonly CungMucBrief[];
  readonly systemPrompt: string;
  readonly khung: KhungChuong;
}

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

export abstract class CungChapterGenerator implements ChapterGenerator {
  private readonly logger = new Logger(this.constructor.name);

  protected constructor(
    private readonly ai: AiClient,
    private readonly chapter: CungChapter,
  ) {}

  coTheSinh(chart: NatalChart): boolean {
    return this.chapter.buildBrief(chart) !== null;
  }

  async generate(chart: NatalChart, budgetMs: number): Promise<ChapterResult | null> {
    const brief = this.chapter.buildBrief(chart);
    if (!brief) return null;

    const mucBriefs = this.chapter.buildMucBriefs(chart);

    const [chinh, ...mucs] = await Promise.all([
      sinhVoiKiem<ThanCuParagraphs>(
        this.ai,
        {
          brief,
          system: this.chapter.systemPrompt,
          schema: THAN_CU_SCHEMA,
          messages: (daThu) =>
            buildCungMessages(
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
      article: assembleCungArticle(this.chapter.khung, brief, chinh.value, sections),
      model: chinh.model,
      attempts: chinh.attempts,
    };
  }

  private async sinhMuc(brief: CungMucBrief, budgetMs: number): Promise<LuanGiaiSection | null> {
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
      this.logger.warn(`bỏ mục "${brief.tieuDe}": ${(error as Error).message.slice(0, 140)}`);
      return null;
    }
  }
}
