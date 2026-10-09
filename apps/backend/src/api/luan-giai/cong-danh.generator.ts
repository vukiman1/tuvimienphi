import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiSection } from '@org/shared-contracts';
import {
  buildCongDanhBrief,
  buildCongDanhMucBriefs,
  type CongDanhMucBrief,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleCongDanhArticle } from './assemble-cong-danh-article';
import type { ChapterResult } from './chapter-generator';
import {
  MUC_SCHEMA,
  THAN_CU_SCHEMA,
  type MucParagraph,
  type ThanCuParagraphs,
} from './prompt/chapter-schema';
import { buildCongDanhMessages, CONG_DANH_SYSTEM_PROMPT } from './prompt/cong-danh-prompt';
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
export class CongDanhGenerator {
  private readonly logger = new Logger(CongDanhGenerator.name);

  constructor(private readonly ai: AiClient) {}

  coTheSinh(chart: NatalChart): boolean {
    return buildCongDanhBrief(chart) !== null;
  }

  async generate(chart: NatalChart, budgetMs: number): Promise<ChapterResult | null> {
    const brief = buildCongDanhBrief(chart);
    if (!brief) return null;

    const mucBriefs = buildCongDanhMucBriefs(chart);

    const [chinh, ...mucs] = await Promise.all([
      sinhVoiKiem<ThanCuParagraphs>(
        this.ai,
        {
          brief,
          system: CONG_DANH_SYSTEM_PROMPT,
          schema: THAN_CU_SCHEMA,
          messages: (daThu) =>
            buildCongDanhMessages(
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
      article: assembleCongDanhArticle(brief, chinh.value, sections),
      model: chinh.model,
      attempts: chinh.attempts,
    };
  }

  private async sinhMuc(
    brief: CongDanhMucBrief,
    budgetMs: number,
  ): Promise<LuanGiaiSection | null> {
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
