import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import type { ChapterBrief, ChapterMucBrief, NatalChart } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import { assembleArticle } from './assemble-article';
import { type ChapterDefinition, type MucCanSinh, MucKind } from './chapter-definition';
import { parseDoanChinh, parseMuc } from './parse-paragraphs';
import { buildMessages } from './prompt/build-messages';
import {
  DOAN_CHINH_SCHEMA,
  MUC_SCHEMA,
  type DoanChinh,
  type MucParagraph,
} from './prompt/chapter-schema';
import { mucSystemPrompt } from './prompt/muc-prompt';
import { sinhVoiKiem } from './sinh-voi-kiem';
import { baiChinh, baiMuc } from './validate/to-bai';

const MUC_ERROR_PREVIEW_LENGTH = 140;

export interface ChapterResult {
  readonly article: LuanGiaiArticle;
  readonly model: string;
  readonly attempts: number;
}

function chiPhanCung(brief: ChapterMucBrief): ChapterBrief {
  return {
    cung: brief.cung,
    chi: brief.chi,
    gioiTinh: brief.gioiTinh,
    chiNamSinh: brief.chiNamSinh,
    chinhTinh: brief.chinhTinh,
    laVoChinhDieu: brief.laVoChinhDieu,
    hungTinh: brief.hungTinh,
    catTinh: brief.catTinh,
    anNgu: brief.anNgu,
    luan: brief.luan,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

@Injectable()
export class ChapterGenerator {
  private readonly logger = new Logger(ChapterGenerator.name);

  constructor(private readonly ai: AiClient) {}

  async generate(
    chapter: ChapterDefinition,
    chart: NatalChart,
    budgetMs: number,
  ): Promise<ChapterResult | null> {
    const brief = chapter.buildBrief(chart);
    if (!brief) return null;

    const khung = chapter.khung(brief);

    const mucCanSinh = chapter.buildMucs(chart);

    const [chinh, ...mucs] = await Promise.all([
      sinhVoiKiem<DoanChinh>(
        this.ai,
        {
          brief,
          system: chapter.systemPrompt,
          schema: DOAN_CHINH_SCHEMA,
          messages: (daThu) => buildMessages(brief, daThu),
          parse: parseDoanChinh,
          toBai: baiChinh,
        },
        budgetMs,
        (lan, model, loi) =>
          this.logger.warn(
            `${chapter.name}: bài chính lần ${lan} bị chặn (${model}): ${loi.join('; ')}`,
          ),
      ),
      ...mucCanSinh.map((muc) => this.sinhMuc(chapter, muc, budgetMs)),
    ]);

    const sections = mucs.filter((muc): muc is LuanGiaiSection => muc !== null);

    return {
      article: assembleArticle(khung, brief, chinh.value, sections),
      model: chinh.model,
      attempts: chinh.attempts,
    };
  }

  private async sinhMuc(
    chapter: ChapterDefinition,
    muc: MucCanSinh,
    budgetMs: number,
  ): Promise<LuanGiaiSection | null> {
    const { brief } = muc;
    try {
      const paragraphs = await this.sinhDoanCuaMuc(muc, budgetMs);
      return {
        slug: brief.muc,
        title: brief.tieuDe,
        sourceCung: brief.sourceCung,
        paragraphs,
      };
    } catch (error) {
      this.logger.warn(
        `${chapter.name}: bỏ mục "${brief.tieuDe}": ${errorMessage(error).slice(0, MUC_ERROR_PREVIEW_LENGTH)}`,
      );
      return null;
    }
  }

  private async sinhDoanCuaMuc(muc: MucCanSinh, budgetMs: number): Promise<string[]> {
    const { brief } = muc;
    switch (muc.kind) {
      case MucKind.PhuTinh: {
        const ket = await sinhVoiKiem<MucParagraph>(
          this.ai,
          {
            brief,
            system: mucSystemPrompt(brief.cung),
            schema: MUC_SCHEMA,
            messages: (daThu) => buildMessages(brief, daThu),
            parse: parseMuc,
            toBai: baiMuc,
          },
          budgetMs,
        );
        return [ket.value.doan];
      }
      case MucKind.CungKhac: {
        const ket = await sinhVoiKiem<DoanChinh>(
          this.ai,
          {
            brief,
            system: muc.systemPrompt,
            schema: DOAN_CHINH_SCHEMA,
            messages: (daThu) => buildMessages(chiPhanCung(brief), daThu),
            parse: parseDoanChinh,
            toBai: baiChinh,
          },
          budgetMs,
        );
        return [ket.value.doan1, ket.value.doan2];
      }
    }
  }
}
