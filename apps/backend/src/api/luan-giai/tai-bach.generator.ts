import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiSection } from '@org/shared-contracts';
import {
  buildTaiBachBrief,
  buildTaiBachMucBriefs,
  type NatalChart,
  type CungMucBrief,
  type PhuTinhMucKey,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { assembleTaiBachArticle } from './assemble-tai-bach-article';
import type { ChapterResult } from './chapter-generator';
import {
  MUC_SCHEMA,
  THAN_CU_SCHEMA,
  type MucParagraph,
  type ThanCuParagraphs,
} from './prompt/chapter-schema';
import { buildMucMessages, mucSystemPrompt } from './prompt/muc-prompt';
import { buildTaiBachMessages, TAI_BACH_SYSTEM_PROMPT } from './prompt/tai-bach-prompt';
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
export class TaiBachGenerator {
  private readonly logger = new Logger(TaiBachGenerator.name);

  constructor(private readonly ai: AiClient) {}

  coTheSinh(chart: NatalChart): boolean {
    return buildTaiBachBrief(chart) !== null;
  }

  async generate(chart: NatalChart, budgetMs: number): Promise<ChapterResult | null> {
    const brief = buildTaiBachBrief(chart);
    if (!brief) return null;

    const mucBriefs = buildTaiBachMucBriefs(chart);

    const [chinh, ...mucs] = await Promise.all([
      sinhVoiKiem<ThanCuParagraphs>(
        this.ai,
        {
          brief,
          system: TAI_BACH_SYSTEM_PROMPT,
          schema: THAN_CU_SCHEMA,
          messages: (daThu) =>
            buildTaiBachMessages(
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
      article: assembleTaiBachArticle(brief, chinh.value, sections),
      model: chinh.model,
      attempts: chinh.attempts,
    };
  }

  private async sinhMuc(
    brief: CungMucBrief<PhuTinhMucKey>,
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
