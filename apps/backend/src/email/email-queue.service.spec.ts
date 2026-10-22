import type { Queue } from 'bullmq';
import { EmailKind, type EmailJob } from './email-job';
import { EmailQueueService } from './email-queue.service';

const RESET: EmailJob = {
  kind: EmailKind.PASSWORD_RESET,
  to: 'a@b.c',
  code: '123456',
  expiryMinutes: 15,
};

describe('EmailQueueService.enqueue', () => {
  let add: jest.Mock;
  let service: EmailQueueService;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue(undefined);
    service = new EmailQueueService({ add } as unknown as Queue<EmailJob>);
  });

  it('names the job after its kind and retries long enough to ride out a short Resend outage', async () => {
    await service.enqueue(RESET);

    expect(add).toHaveBeenCalledWith(
      EmailKind.PASSWORD_RESET,
      RESET,
      expect.objectContaining({
        attempts: 5,
        backoff: { type: 'exponential', delay: 5_000 },
      }),
    );
  });

  it('keeps no finished or failed job around holding a live code', async () => {
    await service.enqueue(RESET);

    expect(add.mock.calls[0][2]).toMatchObject({ removeOnComplete: true, removeOnFail: true });
  });

  it('gives back-to-back requests distinct UUID job ids so Resend never sees a reused key', async () => {
    await service.enqueue(RESET);
    await service.enqueue(RESET);

    const [first, second] = add.mock.calls.map(([, , options]) => options.jobId);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
  });
});
