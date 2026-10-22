import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue, type JobsOptions } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { EMAIL_QUEUE, type EmailJob } from './email-job';

const SEND_ATTEMPTS = 5;
const BACKOFF_DELAY_MS = 5_000;

const EMAIL_JOB_OPTIONS = {
  attempts: SEND_ATTEMPTS,
  backoff: { type: 'exponential', delay: BACKOFF_DELAY_MS },
  removeOnComplete: true,
  removeOnFail: true,
} as const satisfies JobsOptions;

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue(EMAIL_QUEUE) private readonly queue: Queue<EmailJob>) {}

  async enqueue(job: EmailJob): Promise<void> {
    await this.queue.add(job.kind, job, { ...EMAIL_JOB_OPTIONS, jobId: randomUUID() });
  }
}
