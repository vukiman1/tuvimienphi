import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  birthKey,
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiArticle,
  type LuanGiaiChapterResponse,
} from '@org/shared-contracts';
import { buildThanCuBrief, chartFromBirthInput } from '@org/shared-tu-vi';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { ChapterQuotaService } from './chapter-quota.service';
import { LuanGiaiChapterEntity } from './entities/luan-giai-chapter.entity';
import { ChapterQuotaExceededException } from './luan-giai.exceptions';
import {
  LUAN_GIAI_QUEUE,
  SUPPORTED_CHAPTERS,
  type GenerateChapterJob,
} from './luan-giai.constants';

const RETRY_ATTEMPTS = 2;
const BACKOFF_DELAY_MS = 5_000;
const KEEP_COMPLETED = 100;
const KEEP_FAILED = 200;

/** Năm chương còn lại chưa có bảng luận nên sẽ không có bài, dù chờ bao lâu. */
function laChuongCoBang(order: string): boolean {
  return SUPPORTED_CHAPTERS.some((duocHoTro) => duocHoTro === order);
}

@Injectable()
export class LuanGiaiService {
  constructor(
    @InjectRepository(LuanGiaiChapterEntity)
    private readonly repo: Repository<LuanGiaiChapterEntity>,
    @InjectQueue(LUAN_GIAI_QUEUE) private readonly queue: Queue<GenerateChapterJob>,
    private readonly quota: ChapterQuotaService,
  ) {}

  /** Đọc chương đã có. Không cần đăng nhập: bài gắn với lá số chứ không gắn với người xem. */
  async read(key: string, order: string): Promise<LuanGiaiChapterResponse> {
    if (!laChuongCoBang(order)) return { status: LuanGiaiChapterStatus.Unavailable };

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
    if (!laChuongCoBang(order)) return { status: LuanGiaiChapterStatus.Unavailable };

    const key = birthKey(input);

    const daCo = await this.findArticle(key, order);
    if (daCo) return { status: LuanGiaiChapterStatus.Ready, article: daCo };

    // Dựng brief là phép tính thuần, chạy ngay tại đây được. Biết trước là bảng chưa soạn thì đừng
    // xếp hàng và đừng trừ suất của người dùng cho một việc chắc chắn không ra bài.
    const { chart } = chartFromBirthInput(input);
    if (!buildThanCuBrief(chart)) {
      return { status: LuanGiaiChapterStatus.Unavailable };
    }

    if (!(await this.quota.consume(userId))) {
      throw new ChapterQuotaExceededException();
    }

    await this.queue.add(
      'chapter',
      { birthKey: key, order, birth: input },
      {
        // Hai người cùng xem một lá số chỉ tạo một job.
        jobId: `${key}:${order}`,
        attempts: RETRY_ATTEMPTS,
        backoff: { type: 'exponential', delay: BACKOFF_DELAY_MS },
        removeOnComplete: KEEP_COMPLETED,
        removeOnFail: KEEP_FAILED,
      },
    );

    return { status: LuanGiaiChapterStatus.Pending };
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
