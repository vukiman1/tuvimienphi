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
import { chartFromBirthInput, type NatalChart } from '@org/shared-tu-vi';
import { Repository } from 'typeorm';
import { runWithAiCallContext } from '../../ai/port/ai-call-context';
import { ChapterAllowanceService } from '../credits/chapter-allowance.service';
import type { ChapterDefinition } from './generation/chapter-definition';
import { ChapterGenerator } from './generation/chapter-generator';
import { CHAPTER_DEFINITIONS } from './generation/chapter-registry';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { CHAPTER_ORDERS, GENERATION_BUDGET_MS } from './luan-giai.constants';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
} from './luan-giai.exceptions';

@Injectable()
export class LuanGiaiService {
  private readonly logger = new Logger(LuanGiaiService.name);
  private readonly inFlightRequests = new Map<string, Promise<LuanGiaiChapterResponse>>();

  constructor(
    @InjectRepository(LuanGiaiChapterEntity)
    private readonly repo: Repository<LuanGiaiChapterEntity>,
    private readonly allowance: ChapterAllowanceService,
    private readonly generator: ChapterGenerator,
  ) {}

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
          : CHAPTER_DEFINITIONS.has(order)
            ? LuanGiaiChapterStatus.Pending
            : LuanGiaiChapterStatus.Unavailable,
      ]),
    );

    return { chapters };
  }

  async read(key: string, order: string): Promise<LuanGiaiChapterResponse> {
    if (!CHAPTER_DEFINITIONS.has(order)) return { status: LuanGiaiChapterStatus.Unavailable };

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
    const chapter = CHAPTER_DEFINITIONS.get(order);
    if (!chapter) return { status: LuanGiaiChapterStatus.Unavailable };

    const key = birthKey(input);
    const flightKey = `${key}:${order}`;

    const inFlight = this.inFlightRequests.get(flightKey);
    if (inFlight) return this.joinInFlight(inFlight, userId, input, order);

    const flight = this.readOrGenerate(userId, chapter, input, key, order).finally(() =>
      this.inFlightRequests.delete(flightKey),
    );
    this.inFlightRequests.set(flightKey, flight);
    return flight;
  }

  private async joinInFlight(
    inFlight: Promise<LuanGiaiChapterResponse>,
    userId: string,
    input: BirthInput,
    order: string,
  ): Promise<LuanGiaiChapterResponse> {
    try {
      return await inFlight;
    } catch (error) {
      if (error instanceof ChapterQuotaExceededException) return this.request(userId, input, order);
      throw error;
    }
  }

  private async readOrGenerate(
    userId: string,
    chapter: ChapterDefinition,
    input: BirthInput,
    key: string,
    order: string,
  ): Promise<LuanGiaiChapterResponse> {
    const daCo = await this.findArticle(key, order);
    if (daCo) return { status: LuanGiaiChapterStatus.Ready, article: daCo };

    const { chart } = chartFromBirthInput(input);
    if (chapter.buildBrief(chart) === null) {
      return { status: LuanGiaiChapterStatus.Unavailable };
    }

    return this.generateAndSave(userId, chapter, chart, key, order);
  }

  private async generateAndSave(
    userId: string,
    chapter: ChapterDefinition,
    chart: NatalChart,
    key: string,
    order: string,
  ): Promise<LuanGiaiChapterResponse> {
    const source = await this.allowance.consume(userId);
    if (!source) throw new ChapterQuotaExceededException();

    try {
      const ket = await runWithAiCallContext({ userId, label: `luan-giai:${order}` }, () =>
        this.generator.generate(chapter, chart, GENERATION_BUDGET_MS),
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
