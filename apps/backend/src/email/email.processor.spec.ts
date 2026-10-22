import { Logger } from '@nestjs/common';
import { UnrecoverableError, type Job } from 'bullmq';
import { EmailKind, type EmailJob } from './email-job';
import { EmailSendError } from './email.errors';
import { EmailProcessor } from './email.processor';
import type { EmailService } from './email.service';

jest.mock('@org/backend-config', () => ({
  __esModule: true,
  default: () => ({
    redis: { cluster: false, host: 'redis', port: 6379, db: 0, tls: false },
  }),
}));

type SendMethod =
  | 'sendWelcomeEmail'
  | 'sendVerificationCode'
  | 'sendPasswordResetCode'
  | 'sendTwoFactorRecoveryCode';

const WELCOME: EmailJob = { kind: EmailKind.WELCOME, to: 'a@b.c' };
const RESET: EmailJob = {
  kind: EmailKind.PASSWORD_RESET,
  to: 'a@b.c',
  code: '222222',
  expiryMinutes: 15,
};

const SEND_ATTEMPTS = 5;

function jobWith(data: unknown, attemptsMade = 0): Job<EmailJob> {
  return {
    id: 'job-1',
    data,
    attemptsMade,
    opts: { attempts: SEND_ATTEMPTS },
  } as unknown as Job<EmailJob>;
}

describe('EmailProcessor', () => {
  let emailService: Record<SendMethod, jest.Mock>;
  let processor: EmailProcessor;

  beforeEach(() => {
    emailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendVerificationCode: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetCode: jest.fn().mockResolvedValue(undefined),
      sendTwoFactorRecoveryCode: jest.fn().mockResolvedValue(undefined),
    };
    processor = new EmailProcessor(emailService as unknown as EmailService);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each<[EmailJob, SendMethod, readonly unknown[]]>([
    [WELCOME, 'sendWelcomeEmail', ['a@b.c', 'welcome/job-1']],
    [
      { kind: EmailKind.EMAIL_VERIFICATION, to: 'a@b.c', code: '111111', expiryMinutes: 15 },
      'sendVerificationCode',
      ['a@b.c', '111111', 15, 'email-verification/job-1'],
    ],
    [RESET, 'sendPasswordResetCode', ['a@b.c', '222222', 15, 'password-reset/job-1']],
    [
      { kind: EmailKind.TWO_FACTOR_RECOVERY, to: 'a@b.c', code: '333333', expiryMinutes: 15 },
      'sendTwoFactorRecoveryCode',
      ['a@b.c', '333333', 15, 'two-factor-recovery/job-1'],
    ],
  ])('sends %o through %s with a kind/jobId idempotency key', async (data, method, args) => {
    await processor.process(jobWith(data));

    expect(emailService[method]).toHaveBeenCalledWith(...args);
  });

  it('stops retrying when Resend rejects the email itself', async () => {
    emailService.sendWelcomeEmail.mockRejectedValue(
      new EmailSendError(422, 'Invalid `to` field', 'validation_error'),
    );

    await expect(processor.process(jobWith(WELCOME))).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it.each<[number | null, string | null]>([
    [429, 'rate_limit_exceeded'],
    [500, 'internal_server_error'],
    [503, null],
    [null, null],
    [409, 'concurrent_idempotent_requests'],
  ])('keeps retrying a transient Resend failure (%p %p)', async (statusCode, code) => {
    const failure = new EmailSendError(statusCode, 'try later', code);
    emailService.sendWelcomeEmail.mockRejectedValue(failure);

    await expect(processor.process(jobWith(WELCOME))).rejects.toBe(failure);
  });

  it('refuses a job whose kind it does not know', async () => {
    await expect(processor.process(jobWith({ kind: 'newsletter', to: 'a@b.c' }))).rejects.toThrow(
      /newsletter/,
    );
  });

  it('logs a failed job without the code or the recipient', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    processor.onFailed(jobWith(RESET, 1), new EmailSendError(500, 'down', null));

    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain('password-reset');
    expect(logged).toContain('job-1');
    expect(logged).not.toContain('a@b.c');
    expect(logged).not.toContain('222222');
  });

  it('reports a job that ran out of attempts as a lost email, not another retry', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    processor.onFailed(jobWith(RESET, SEND_ATTEMPTS), new EmailSendError(500, 'down', null));

    expect(warn).not.toHaveBeenCalled();
    const logged = JSON.stringify(error.mock.calls);
    expect(logged).toContain('password-reset');
    expect(logged).toContain('job-1');
    expect(logged).not.toContain('a@b.c');
    expect(logged).not.toContain('222222');
  });

  it('reports an unrecoverable failure as a lost email on its first attempt', () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    processor.onFailed(jobWith(RESET, 1), new UnrecoverableError('Invalid `to` field'));

    expect(error).toHaveBeenCalled();
  });
});
