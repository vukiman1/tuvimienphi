import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProxyService } from '../core/proxy.service';
import { LICHDUNGSU_QUEUE, RATE_LIMIT, WORKER_CONCURRENCY } from './lichdungsu.constants';
import { LichDungSuJobData, LichDungSuQueueService } from './lichdungsu.queue.service';
import {
  VAN_HAN_DISPATCH_JOB,
  VAN_HAN_SCRAPE_JOB,
  ZODIAC_SIGNS,
} from './van-han/van-han.constants';
import { VanHanScraper } from './van-han/van-han.scraper';
import { VanHanService } from './van-han/van-han.service';

@Processor(LICHDUNGSU_QUEUE, { concurrency: WORKER_CONCURRENCY, limiter: RATE_LIMIT })
export class LichDungSuProcessor extends WorkerHost {
  private readonly logger = new Logger(LichDungSuProcessor.name);

  constructor(
    private readonly vanHanScraper: VanHanScraper,
    private readonly vanHan: VanHanService,
    private readonly proxies: ProxyService,
    private readonly queue: LichDungSuQueueService,
  ) {
    super();
  }

  async process(job: Job<LichDungSuJobData>): Promise<{ status: string }> {
    switch (job.name) {
      case VAN_HAN_DISPATCH_JOB: {
        const count = await this.queue.enqueueVanHanAll();
        this.logger.log(`dispatched ${count} vận hạn jobs`);
        return { status: `dispatched:${count}` };
      }
      case VAN_HAN_SCRAPE_JOB:
        return this.scrapeVanHan(job);
      default:
        throw new Error(`Unknown job "${job.name}" on ${LICHDUNGSU_QUEUE}`);
    }
  }

  private async scrapeVanHan(job: Job<LichDungSuJobData>): Promise<{ status: string }> {
    if (!('order' in job.data)) {
      throw new Error(`${VAN_HAN_SCRAPE_JOB} missing zodiac payload`);
    }

    const { order, slug, name } = job.data;
    const zodiac = ZODIAC_SIGNS.find((sign) => sign.order === order && sign.slug === slug);
    if (!zodiac) {
      throw new Error(`Unknown zodiac order=${order} slug=${slug}`);
    }

    const proxy = await this.proxies.next();
    this.logger.log(`scraping vận hạn ${name}${proxy ? ` via ${proxy}` : ' (no proxy)'}`);

    try {
      const content = await this.vanHanScraper.scrapeVanHan(order, slug, zodiac.name, proxy);
      await this.vanHan.save(zodiac, content);
      this.logger.log(`saved ${name} năm ${content.year}`);
      return { status: `saved:${name}:${content.year}` };
    } catch (error) {
      if (proxy) {
        await this.proxies.markBad(proxy);
      }
      throw error;
    }
  }
}
