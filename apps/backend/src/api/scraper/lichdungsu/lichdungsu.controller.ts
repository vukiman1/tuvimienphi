import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { LichDungSuQueueService } from './lichdungsu.queue.service';

@UseGuards(AuthGuard(StrategyKey.JWT.USER))
@Controller('scraper/lichdungsu')
export class LichDungSuController {
  constructor(private readonly queue: LichDungSuQueueService) {}

  @Post('van-han')
  async scrapeVanHan() {
    const enqueued = await this.queue.enqueueVanHanAll();
    return { enqueued };
  }
}
