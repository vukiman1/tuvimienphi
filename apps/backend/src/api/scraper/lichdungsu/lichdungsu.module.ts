import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperCoreModule } from '../core/core.module';
import { LICHDUNGSU_QUEUE } from './lichdungsu.constants';
import { LichDungSuController } from './lichdungsu.controller';
import { LichDungSuProcessor } from './lichdungsu.processor';
import { LichDungSuQueueService } from './lichdungsu.queue.service';
import { LichDungSuScheduler } from './lichdungsu.scheduler';
import { VanHanEntity } from './van-han/entities/van-han.entity';
import { VanHanPublicController } from './van-han/van-han.public.controller';
import { VanHanScraper } from './van-han/van-han.scraper';
import { VanHanService } from './van-han/van-han.service';

@Module({
  imports: [
    ScraperCoreModule,
    BullModule.registerQueue({ name: LICHDUNGSU_QUEUE }),
    BullBoardModule.forFeature({ name: LICHDUNGSU_QUEUE, adapter: BullMQAdapter }),
    TypeOrmModule.forFeature([VanHanEntity]),
  ],
  controllers: [LichDungSuController, VanHanPublicController],
  providers: [
    VanHanScraper,
    VanHanService,
    LichDungSuQueueService,
    LichDungSuProcessor,
    LichDungSuScheduler,
  ],
  exports: [LichDungSuQueueService, VanHanService],
})
export class ScraperLichDungSuModule {}
