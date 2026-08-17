import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JOBS_QUEUE, type JobData } from './queue.constants';

const RETRY_ATTEMPTS = 3;
const BACKOFF_DELAY_MS = 2_000;
const KEEP_COMPLETED = 50;
const KEEP_FAILED = 100;

@Injectable()
export class QueueService {
  constructor(@InjectQueue(JOBS_QUEUE) private readonly queue: Queue<JobData>) {}

  enqueue(label: string) {
    return this.queue.add(
      'process',
      { label },
      {
        attempts: RETRY_ATTEMPTS,
        backoff: { type: 'exponential', delay: BACKOFF_DELAY_MS },
        removeOnComplete: KEEP_COMPLETED,
        removeOnFail: KEEP_FAILED,
      },
    );
  }

  scheduleHourly() {
    return this.queue.upsertJobScheduler(
      'hourly-heartbeat',
      { pattern: '0 * * * *' },
      { name: 'heartbeat', data: { label: 'hourly' } },
    );
  }

  getCounts() {
    return this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
  }
}
