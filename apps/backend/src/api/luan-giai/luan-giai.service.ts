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
import { buildThanCuBrief, chartFromBirthInput } from '@org/shared-tu-vi';
import { Repository } from 'typeorm';
import { ChapterQuotaService } from './chapter-quota.service';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { CHAPTER_ORDERS, GENERATION_BUDGET_MS, SUPPORTED_CHAPTERS } from './luan-giai.constants';
import {
  ChapterGenerationFailedException,
  ChapterQuotaExceededException,
} from './luan-giai.exceptions';
import { ThanCuGenerator } from './than-cu.generator';

/** Năm chương còn lại chưa có bảng luận nên sẽ không có bài, dù chờ bao lâu. */
function laChuongCoBang(order: string): boolean {
  return SUPPORTED_CHAPTERS.some((duocHoTro) => duocHoTro === order);
}

@Injectable()
export class LuanGiaiService {
  private readonly logger = new Logger(LuanGiaiService.name);

  constructor(
    @InjectRepository(LuanGiaiChapterEntity)
    private readonly repo: Repository<LuanGiaiChapterEntity>,
    private readonly quota: ChapterQuotaService,
    private readonly generator: ThanCuGenerator,
  ) {}

  /**
   * Trạng thái cả sáu chương, hỏi một lượt khi mở trang. Chỉ trả trạng thái chứ không trả bài: mục
   * lục chỉ cần biết chương nào mở được, còn nội dung thì lấy khi người ta thật sự đọc chương đó.
   */
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
          : laChuongCoBang(order)
            ? LuanGiaiChapterStatus.Pending
            : LuanGiaiChapterStatus.Unavailable,
      ]),
    );

    return { chapters };
  }

  /** Đọc chương đã có. Không cần đăng nhập: bài gắn với lá số chứ không gắn với người xem. */
  async read(key: string, order: string): Promise<LuanGiaiChapterResponse> {
    if (!laChuongCoBang(order)) return { status: LuanGiaiChapterStatus.Unavailable };

    const article = await this.findArticle(key, order);
    return article
      ? { status: LuanGiaiChapterStatus.Ready, article }
      : { status: LuanGiaiChapterStatus.Pending };
  }

  /**
   * Sinh ngay trong request rồi trả bài luôn. Đo thật thì một lượt mất 1,5–2,2 giây và ba lượt sinh
   * lại mất 5,7 giây, còn cách trần 30 giây của hàm serverless khá xa; `GENERATION_BUDGET_MS` gác
   * phần đuôi dài, vì đã gặp model trả UNAVAILABLE sau 27 giây.
   */
  async request(
    userId: string,
    input: BirthInput,
    order: string,
  ): Promise<LuanGiaiChapterResponse> {
    if (!laChuongCoBang(order)) return { status: LuanGiaiChapterStatus.Unavailable };

    const key = birthKey(input);

    const daCo = await this.findArticle(key, order);
    if (daCo) return { status: LuanGiaiChapterStatus.Ready, article: daCo };

    // Dựng brief là phép tính thuần, không gọi mô hình. Biết trước bảng chưa soạn tới lá số này thì
    // đừng trừ suất của người dùng cho một việc chắc chắn không ra bài.
    const { chart } = chartFromBirthInput(input);
    if (!buildThanCuBrief(chart)) {
      return { status: LuanGiaiChapterStatus.Unavailable };
    }

    // Trừ trước chứ không trừ sau: trừ sau thì mười request song song cùng lọt qua cửa.
    if (!(await this.quota.consume(userId))) {
      throw new ChapterQuotaExceededException();
    }

    try {
      const ket = await this.generator.generate(chart, GENERATION_BUDGET_MS);
      if (!ket) {
        await this.quota.refund(userId);
        return { status: LuanGiaiChapterStatus.Unavailable };
      }

      await this.save(key, order, ket.article, ket.model, ket.attempts);
      return { status: LuanGiaiChapterStatus.Ready, article: ket.article };
    } catch (error) {
      // Hỏng vì phía hệ thống thì hoàn suất lại; người dùng không nên trả giá cho lỗi của mình.
      await this.quota.refund(userId);
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
