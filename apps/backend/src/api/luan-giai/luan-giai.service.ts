import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  birthKey,
  isYearDependentChapter,
  LuanGiaiChapterStatus,
  MAX_VIEW_YEAR,
  MIN_BIRTH_YEAR,
  type BirthInput,
  type LuanGiaiArticle,
  type LuanGiaiChapterResponse,
  type LuanGiaiChapterStatusMap,
} from '@org/shared-contracts';
import { chartFromBirthInput, type NatalChart } from '@org/shared-tu-vi';
import { Repository } from 'typeorm';
import { runWithAiCallContext } from '../../ai/port/ai-call-context';
import { ChapterAllowanceService } from '../credits/chapter-allowance.service';
import { FunnelService } from '../funnel/funnel.service';
import type { ChapterContext, ChapterDefinition } from './generation/chapter-definition';
import { ChapterGenerator } from './generation/chapter-generator';
import { CHAPTER_DEFINITIONS } from './generation/chapter-registry';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { CHAPTER_ORDERS, GENERATION_BUDGET_MS, NO_VIEW_YEAR } from './luan-giai.constants';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
  InvalidViewYearException,
  ViewYearRequiredException,
} from './luan-giai.exceptions';

interface ChapterSlot {
  readonly birthKey: string;
  readonly order: string;
  readonly viewYear: number;
}

function slotId(order: string, viewYear: number): string {
  return `${order}:${viewYear}`;
}

function contextOf(slot: ChapterSlot): ChapterContext {
  return {
    viewYear: isYearDependentChapter(slot.order) ? slot.viewYear : null,
    currentYear: new Date().getFullYear(),
  };
}

@Injectable()
export class LuanGiaiService {
  private readonly logger = new Logger(LuanGiaiService.name);
  private readonly inFlightRequests = new Map<string, Promise<LuanGiaiChapterResponse>>();

  constructor(
    @InjectRepository(LuanGiaiChapterEntity)
    private readonly repo: Repository<LuanGiaiChapterEntity>,
    private readonly allowance: ChapterAllowanceService,
    private readonly generator: ChapterGenerator,
    private readonly funnel: FunnelService,
  ) {}

  async status(key: string, viewYear?: number): Promise<LuanGiaiChapterStatusMap> {
    const rows = await this.repo.find({
      where: { birthKey: key },
      select: { chapterOrder: true, viewYear: true },
    });
    const daCo = new Set(rows.map((row) => slotId(row.chapterOrder, row.viewYear)));
    const isReady = (order: string): boolean => {
      if (!isYearDependentChapter(order)) return daCo.has(slotId(order, NO_VIEW_YEAR));
      return viewYear !== undefined && daCo.has(slotId(order, viewYear));
    };

    const chapters = Object.fromEntries(
      CHAPTER_ORDERS.map((order) => [
        order,
        isReady(order) ? LuanGiaiChapterStatus.Ready : LuanGiaiChapterStatus.Pending,
      ]),
    );

    return { chapters };
  }

  async read(key: string, order: string, viewYear?: number): Promise<LuanGiaiChapterResponse> {
    if (!CHAPTER_DEFINITIONS.has(order)) return { status: LuanGiaiChapterStatus.Unavailable };

    const article = await this.findArticle(this.slotOf(key, order, viewYear));
    return article
      ? { status: LuanGiaiChapterStatus.Ready, article }
      : { status: LuanGiaiChapterStatus.Pending };
  }

  async request(
    userId: string,
    input: BirthInput,
    order: string,
    viewYear?: number,
  ): Promise<LuanGiaiChapterResponse> {
    const chapter = CHAPTER_DEFINITIONS.get(order);
    if (!chapter) return { status: LuanGiaiChapterStatus.Unavailable };

    const slot = this.slotOf(birthKey(input), order, viewYear);
    const flightKey = `${slot.birthKey}:${slotId(slot.order, slot.viewYear)}`;

    const inFlight = this.inFlightRequests.get(flightKey);
    if (inFlight) return this.joinInFlight(inFlight, userId, input, slot);

    const flight = this.readOrGenerate(userId, chapter, input, slot).finally(() =>
      this.inFlightRequests.delete(flightKey),
    );
    this.inFlightRequests.set(flightKey, flight);
    return flight;
  }

  private slotOf(key: string, order: string, viewYear?: number): ChapterSlot {
    if (!isYearDependentChapter(order)) {
      return { birthKey: key, order, viewYear: NO_VIEW_YEAR };
    }
    if (viewYear === undefined) throw new ViewYearRequiredException(order);
    if (viewYear < MIN_BIRTH_YEAR || viewYear > MAX_VIEW_YEAR) {
      throw new InvalidViewYearException(viewYear);
    }
    return { birthKey: key, order, viewYear };
  }

  private async joinInFlight(
    inFlight: Promise<LuanGiaiChapterResponse>,
    userId: string,
    input: BirthInput,
    slot: ChapterSlot,
  ): Promise<LuanGiaiChapterResponse> {
    try {
      return await inFlight;
    } catch (error) {
      if (error instanceof ChapterQuotaExceededException) {
        return this.request(userId, input, slot.order, slot.viewYear);
      }
      throw error;
    }
  }

  private async readOrGenerate(
    userId: string,
    chapter: ChapterDefinition,
    input: BirthInput,
    slot: ChapterSlot,
  ): Promise<LuanGiaiChapterResponse> {
    const daCo = await this.findArticle(slot);
    if (daCo) return { status: LuanGiaiChapterStatus.Ready, article: daCo };

    const { chart } = chartFromBirthInput(input);
    if (chapter.buildBrief(chart, contextOf(slot)) === null) {
      return { status: LuanGiaiChapterStatus.Unavailable };
    }

    return this.generateAndSave(userId, chapter, chart, slot);
  }

  private async generateAndSave(
    userId: string,
    chapter: ChapterDefinition,
    chart: NatalChart,
    slot: ChapterSlot,
  ): Promise<LuanGiaiChapterResponse> {
    const source = await this.allowance.consume(userId);
    if (!source) throw new ChapterQuotaExceededException();

    try {
      const ket = await runWithAiCallContext({ userId, label: `luan-giai:${slot.order}` }, () =>
        this.generator.generate(chapter, chart, GENERATION_BUDGET_MS, contextOf(slot)),
      );
      if (!ket) {
        await this.allowance.refund(userId, source);
        return { status: LuanGiaiChapterStatus.Unavailable };
      }

      await this.save(slot, ket.article, ket.model, ket.attempts);
      void this.funnel.recordUnlock(slot.birthKey, source);
      return { status: LuanGiaiChapterStatus.Ready, article: ket.article };
    } catch (error) {
      await this.allowance.refund(userId, source);
      this.logger.warn(
        `${slot.birthKey}:${slotId(slot.order, slot.viewYear)} sinh hỏng: ${(error as Error).message}`,
      );
      throw new ChapterGenerationFailedException();
    }
  }

  private async save(
    slot: ChapterSlot,
    article: LuanGiaiArticle,
    model: string,
    attempts: number,
  ): Promise<void> {
    await this.repo.upsert(
      {
        birthKey: slot.birthKey,
        chapterOrder: slot.order,
        viewYear: slot.viewYear,
        article,
        model,
        attempts,
      },
      ['birthKey', 'chapterOrder', 'viewYear'],
    );
  }

  private async findArticle(slot: ChapterSlot): Promise<LuanGiaiArticle | null> {
    const row = await this.repo.findOne({
      where: { birthKey: slot.birthKey, chapterOrder: slot.order, viewYear: slot.viewYear },
    });
    return row?.article ?? null;
  }
}
