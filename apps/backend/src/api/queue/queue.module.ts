import { BullModule } from '@nestjs/bullmq';
import { Module, type Provider } from '@nestjs/common';
import configuration from '@org/backend-config';
import { queueBoardFeatureImports } from '../../app/queue-board-registration';
import { JOBS_QUEUE } from './queue.constants';
import { QueueProcessor } from './queue.processor';
import { QueueScheduler } from './queue.scheduler';
import { shouldConsumeJobs } from './queue-role';
import { QueueService } from './queue.service';

const { queue } = configuration();

function jobRunners(): Provider[] {
  return shouldConsumeJobs(queue.role) ? [QueueProcessor, QueueScheduler] : [];
}

@Module({
  imports: [
    BullModule.registerQueue({ name: JOBS_QUEUE }),
    ...queueBoardFeatureImports(JOBS_QUEUE),
  ],
  providers: [QueueService, ...jobRunners()],
  exports: [QueueService],
})
export class QueueModule {}
