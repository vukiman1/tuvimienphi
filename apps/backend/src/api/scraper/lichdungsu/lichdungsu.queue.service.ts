import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { LICHDUNGSU_QUEUE } from './lichdungsu.constants';
import {
  VAN_HAN_DISPATCH_JOB,
  VAN_HAN_SCRAPE_JOB,
  VAN_HAN_YEARLY_PATTERN,
  ZODIAC_SIGNS,
  type ScrapeZodiacJob,
} from './van-han/van-han.constants';

const RETRY_ATTEMPTS = 3;
const BACKOFF_DELAY_MS = 5_000;

export type LichDungSuJobData = ScrapeZodiacJob | Record<string, never>;

@Injectable()
export class LichDungSuQueueService {
  constructor(@InjectQueue(LICHDUNGSU_QUEUE) private readonly queue: Queue<LichDungSuJobData>) {}

  async enqueueVanHanAll(): Promise<number> {
    await this.queue.addBulk(
      ZODIAC_SIGNS.map((zodiac) => ({
        name: VAN_HAN_SCRAPE_JOB,
        data: { order: zodiac.order, slug: zodiac.slug, name: zodiac.name },
        opts: {
          attempts: RETRY_ATTEMPTS,
          backoff: { type: 'exponential', delay: BACKOFF_DELAY_MS },
          removeOnComplete: 50,
          removeOnFail: 50,
        },
      })),
    );
    return ZODIAC_SIGNS.length;
  }

  scheduleAll() {
    return this.queue.upsertJobScheduler(
      'van-han-yearly',
      { pattern: VAN_HAN_YEARLY_PATTERN },
      { name: VAN_HAN_DISPATCH_JOB, data: {} },
    );
  }
}
