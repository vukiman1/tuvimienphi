import { Injectable, Logger } from '@nestjs/common';
import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import {
  buildMucBriefs,
  buildThanCuBrief,
  type MucBrief,
  type NatalChart,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import { assembleArticle } from './assemble-article';
import { parseDoanChinh, parseMuc } from './parse-paragraphs';
import { buildMessages } from './prompt/build-messages';
import {
  DOAN_CHINH_SCHEMA,
  MUC_SCHEMA,
  type DoanChinh,
  type MucParagraph,
} from './prompt/chapter-schema';
import { khungThanCu } from './prompt/khung-than-cu';
import { mucSystemPrompt } from './prompt/muc-prompt';
import { THAN_CU_SYSTEM_PROMPT } from './prompt/than-cu-prompt';
import { sinhVoiKiem } from './sinh-voi-kiem';
import { baiChinh, baiMuc } from './validate/to-bai';

export interface ThanCuResult {
  readonly article: LuanGiaiArticle;
  /** Model nào viết ra bài và tổng số lượt phải sinh lại — theo dõi để thấy prompt xuống cấp sớm. */
  readonly model: string;
  readonly attempts: number;
}

@Injectable()
export class ThanCuGenerator {
  private readonly logger = new Logger(ThanCuGenerator.name);

  constructor(private readonly ai: AiClient) {}

  coTheSinh(chart: NatalChart): boolean {
    return buildThanCuBrief(chart) !== null;
  }

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
      sinhVoiKiem<DoanChinh>(
        this.ai,
        {
          brief,
          system: THAN_CU_SYSTEM_PROMPT,
          schema: DOAN_CHINH_SCHEMA,
          messages: (daThu) => buildMessages(brief, daThu),
          parse: parseDoanChinh,
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
      article: assembleArticle(khungThanCu(brief.cung), brief, chinh.value, sections),
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
          system: mucSystemPrompt(brief.cung),
          schema: MUC_SCHEMA,
          messages: (daThu) => buildMessages(brief, daThu),
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
