import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOBS_QUEUE, type JobData } from './queue.constants';

const WORKER_CONCURRENCY = 3;

@Processor(JOBS_QUEUE, { concurrency: WORKER_CONCURRENCY })
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  async process(job: Job<JobData>): Promise<{ label: string; finishedAt: string }> {
    this.logger.log(`processing "${job.data.label}" (attempt ${job.attemptsMade + 1})`);
    return { label: job.data.label, finishedAt: new Date().toISOString() };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JobData>) {
    this.logger.log(`completed "${job.data.label}"`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<JobData>, error: Error) {
    this.logger.warn(`failed "${job.data.label}" (attempt ${job.attemptsMade}): ${error.message}`);
  }
}
