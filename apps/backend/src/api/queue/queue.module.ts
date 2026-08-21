import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { queueBoardFeatureImports } from '../../app/queue-board-registration';
import { JOBS_QUEUE } from './queue.constants';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: JOBS_QUEUE }),
    ...queueBoardFeatureImports(JOBS_QUEUE),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
