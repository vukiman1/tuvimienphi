import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { chartFromBirthInput } from '@org/shared-tu-vi';
import { Job } from 'bullmq';
import { LUAN_GIAI_QUEUE, type GenerateChapterJob } from './luan-giai.constants';
import { LuanGiaiService } from './luan-giai.service';
import { ThanCuGenerator } from './than-cu.generator';

/** Một lượt sinh mất vài giây và có thể phải sinh lại ba lần, nên đừng chạy nhiều hơn số này song song. */
const WORKER_CONCURRENCY = 2;

@Processor(LUAN_GIAI_QUEUE, { concurrency: WORKER_CONCURRENCY })
export class LuanGiaiProcessor extends WorkerHost {
  private readonly logger = new Logger(LuanGiaiProcessor.name);

  constructor(
    private readonly generator: ThanCuGenerator,
    private readonly luanGiai: LuanGiaiService,
  ) {
    super();
  }

  async process(job: Job<GenerateChapterJob>): Promise<void> {
    const { birthKey, order, birth } = job.data;
    // Worker dựng lại lá số từ ngày sinh, không nhận lá số qua job: dữ liệu đi thẳng vào prompt.
    const { chart } = chartFromBirthInput(birth);

    const ket = await this.generator.generate(chart);
    if (!ket) {
      this.logger.warn(`${birthKey}:${order} — bảng luận chưa soạn tới lá số này, không ghi gì`);
      return;
    }

    await this.luanGiai.save(birthKey, order, ket.article, ket.model, ket.attempts);
    this.logger.log(`${birthKey}:${order} xong sau ${ket.attempts} lần (${ket.model})`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<GenerateChapterJob>, error: Error) {
    this.logger.warn(
      `${job.data.birthKey}:${job.data.order} hỏng ở lần thử ${job.attemptsMade}: ${error.message}`,
    );
  }
}
