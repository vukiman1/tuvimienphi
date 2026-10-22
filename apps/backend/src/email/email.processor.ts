import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import configuration from '@org/backend-config';
import { UnrecoverableError, type Job } from 'bullmq';
import { workerConnection } from '../app/redis-connection';
import { EMAIL_QUEUE, EmailKind, type EmailJob } from './email-job';
import { EmailSendError, UnknownEmailKindError } from './email.errors';
import { EmailService } from './email.service';

const EMAIL_WORKER_CONCURRENCY = 2;
const RESEND_REQUESTS_PER_WINDOW = 2;
const RESEND_RATE_WINDOW_MS = 1_000;
const RATE_LIMITED_STATUS = 429;
const FIRST_SERVER_ERROR_STATUS = 500;
const IDEMPOTENT_REQUEST_IN_PROGRESS = 'concurrent_idempotent_requests';
const BULLMQ_DEFAULT_ATTEMPTS = 1;

function isRetryable({ statusCode, code }: EmailSendError): boolean {
  return (
    statusCode === null ||
    statusCode === RATE_LIMITED_STATUS ||
    statusCode >= FIRST_SERVER_ERROR_STATUS ||
    code === IDEMPOTENT_REQUEST_IN_PROGRESS
  );
}

function isFinalFailure(job: Job<EmailJob>, error: Error): boolean {
  return (
    error instanceof UnrecoverableError ||
    job.attemptsMade >= (job.opts.attempts ?? BULLMQ_DEFAULT_ATTEMPTS)
  );
}

@Processor(EMAIL_QUEUE, {
  connection: workerConnection(configuration().redis),
  concurrency: EMAIL_WORKER_CONCURRENCY,
  limiter: { max: RESEND_REQUESTS_PER_WINDOW, duration: RESEND_RATE_WINDOW_MS },
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJob>): Promise<void> {
    try {
      await this.send(job.data, `${job.data.kind}/${job.id}`);
    } catch (error: unknown) {
      if (error instanceof EmailSendError && !isRetryable(error)) {
        throw new UnrecoverableError(error.message);
      }
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJob>, error: Error): void {
    const summary = `${job.data.kind} email job ${job.id} (attempt ${job.attemptsMade}): ${error.message}`;
    if (isFinalFailure(job, error)) {
      this.logger.error(`gave up on ${summary}`);
      return;
    }
    this.logger.warn(`failed ${summary}`);
  }

  private send(email: EmailJob, idempotencyKey: string): Promise<void> {
    switch (email.kind) {
      case EmailKind.WELCOME:
        return this.emailService.sendWelcomeEmail(email.to, idempotencyKey);
      case EmailKind.EMAIL_VERIFICATION:
        return this.emailService.sendVerificationCode(
          email.to,
          email.code,
          email.expiryMinutes,
          idempotencyKey,
        );
      case EmailKind.PASSWORD_RESET:
        return this.emailService.sendPasswordResetCode(
          email.to,
          email.code,
          email.expiryMinutes,
          idempotencyKey,
        );
      case EmailKind.TWO_FACTOR_RECOVERY:
        return this.emailService.sendTwoFactorRecoveryCode(
          email.to,
          email.code,
          email.expiryMinutes,
          idempotencyKey,
        );
      default: {
        const unhandled: never = email;
        throw new UnknownEmailKindError(unhandled);
      }
    }
  }
}
