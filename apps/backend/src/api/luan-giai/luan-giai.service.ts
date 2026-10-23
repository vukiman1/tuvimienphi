import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  birthKey,
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiArticle,
  type LuanGiaiChapterResponse,
  type LuanGiaiChapterStatusMap,
} from '@org/shared-contracts';
import { chartFromBirthInput } from '@org/shared-tu-vi';
import { Repository } from 'typeorm';
import { runWithAiCallContext } from '../../ai/port/ai-call-context';
import { ChapterAllowanceService } from '../credits/chapter-allowance.service';
import { CongDanhGenerator } from './cong-danh.generator';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import type { ChapterGenerator } from './chapter-generator';
import { MenhGenerator } from './menh.generator';
import {
  CHAPTER_CONG_DANH,
  CHAPTER_MENH,
  CHAPTER_ORDERS,
  CHAPTER_TAI_BACH,
  CHAPTER_THAN_CU,
  CHAPTER_TINH_DUYEN,
  GENERATION_BUDGET_MS,
} from './luan-giai.constants';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
} from './luan-giai.exceptions';
import { TaiBachGenerator } from './tai-bach.generator';
import { TinhDuyenGenerator } from './tinh-duyen.generator';
import { ThanCuGenerator } from './than-cu.generator';

@Injectable()
export class LuanGiaiService {
  private readonly logger = new Logger(LuanGiaiService.name);

  private readonly generators: Readonly<Record<string, ChapterGenerator>>;

  constructor(
    @InjectRepository(LuanGiaiChapterEntity)
    private readonly repo: Repository<LuanGiaiChapterEntity>,
    private readonly allowance: ChapterAllowanceService,
    thanCu: ThanCuGenerator,
    menh: MenhGenerator,
    congDanh: CongDanhGenerator,
    taiBach: TaiBachGenerator,
    tinhDuyen: TinhDuyenGenerator,
  ) {
    this.generators = {
      [CHAPTER_THAN_CU]: thanCu,
      [CHAPTER_MENH]: menh,
      [CHAPTER_CONG_DANH]: congDanh,
      [CHAPTER_TAI_BACH]: taiBach,
      [CHAPTER_TINH_DUYEN]: tinhDuyen,
    };
  }

  async status(key: string): Promise<LuanGiaiChapterStatusMap> {
    const daCo = new Set(
      (
        await this.repo.find({
          where: { birthKey: key },
          select: { chapterOrder: true },
        })
      ).map((row) => row.chapterOrder),
    );

    const chapters = Object.fromEntries(
      CHAPTER_ORDERS.map((order) => [
        order,
        daCo.has(order)
          ? LuanGiaiChapterStatus.Ready
          : this.generators[order]
            ? LuanGiaiChapterStatus.Pending
            : LuanGiaiChapterStatus.Unavailable,
      ]),
    );

    return { chapters };
  }

  async read(key: string, order: string): Promise<LuanGiaiChapterResponse> {
    if (!this.generators[order]) return { status: LuanGiaiChapterStatus.Unavailable };

    const article = await this.findArticle(key, order);
    return article
      ? { status: LuanGiaiChapterStatus.Ready, article }
      : { status: LuanGiaiChapterStatus.Pending };
  }

  async request(
    userId: string,
    input: BirthInput,
    order: string,
  ): Promise<LuanGiaiChapterResponse> {
    const generator = this.generators[order];
    if (!generator) return { status: LuanGiaiChapterStatus.Unavailable };

    const key = birthKey(input);

    const daCo = await this.findArticle(key, order);
    if (daCo) return { status: LuanGiaiChapterStatus.Ready, article: daCo };

    const { chart } = chartFromBirthInput(input);
    if (!generator.coTheSinh(chart)) {
      return { status: LuanGiaiChapterStatus.Unavailable };
    }

    const source = await this.allowance.consume(userId);
    if (!source) throw new ChapterQuotaExceededException();

    try {
      const ket = await runWithAiCallContext({ userId, label: `luan-giai:${order}` }, () =>
        generator.generate(chart, GENERATION_BUDGET_MS),
      );
      if (!ket) {
        await this.allowance.refund(userId, source);
        return { status: LuanGiaiChapterStatus.Unavailable };
      }

      await this.save(key, order, ket.article, ket.model, ket.attempts);
      return { status: LuanGiaiChapterStatus.Ready, article: ket.article };
    } catch (error) {
      await this.allowance.refund(userId, source);
      this.logger.warn(`${key}:${order} sinh hỏng: ${(error as Error).message}`);
      throw new ChapterGenerationFailedException();
    }
  }

  async save(
    key: string,
    order: string,
    article: LuanGiaiArticle,
    model: string,
    attempts: number,
  ): Promise<void> {
    await this.repo.upsert({ birthKey: key, chapterOrder: order, article, model, attempts }, [
      'birthKey',
      'chapterOrder',
    ]);
  }

  private async findArticle(key: string, order: string): Promise<LuanGiaiArticle | null> {
    const row = await this.repo.findOne({ where: { birthKey: key, chapterOrder: order } });
    return row?.article ?? null;
  }
}
