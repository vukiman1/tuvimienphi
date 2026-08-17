import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { LichDungSuQueueService } from './lichdungsu.queue.service';
import { VanHanService } from './van-han/van-han.service';

@Injectable()
export class LichDungSuScheduler implements OnModuleInit {
  private readonly logger = new Logger(LichDungSuScheduler.name);

  constructor(
    private readonly queue: LichDungSuQueueService,
    private readonly vanHan: VanHanService,
  ) {}

  onModuleInit(): void {
    void this.seed();
  }

  private async seed(): Promise<void> {
    try {
      await this.queue.scheduleAll();

      const year = new Date().getFullYear();
      const existing = await this.vanHan.findByYear(year);
      if (existing.length === 0) {
        await this.queue.enqueueVanHanAll();
        this.logger.log(`no vận hạn data for ${year}, seeding initial scrape`);
      }
    } catch (error) {
      this.logger.error('scraper seed failed (server still up)', error);
    }
  }
}
