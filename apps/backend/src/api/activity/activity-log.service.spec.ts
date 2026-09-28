import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { ActivityLogService } from './activity-log.service';

function serviceWith(insert: jest.Mock): ActivityLogService {
  const repo = { insert } as unknown as Repository<ActivityLogEntity>;
  return new ActivityLogService(repo);
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

describe('ActivityLogService.record', () => {
  it('keeps the actor email when there is no account to point at, so a failed login is still traceable', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);

    serviceWith(insert).record('auth.login.failed', { actorEmail: 'stranger@example.com' });
    await settle();

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'auth.login.failed',
        userId: null,
        actorEmail: 'stranger@example.com',
      }),
    );
  });

  it('lets the caller through when the activity table cannot be written', async () => {
    const logged = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const insert = jest.fn().mockRejectedValue(new Error('database is down'));

    expect(() => serviceWith(insert).record('auth.login.succeeded')).not.toThrow();
    await settle();

    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  it('refuses an event name too long for the column instead of losing it silently', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);

    serviceWith(insert).record('a'.repeat(65));
    await settle();

    expect(insert).not.toHaveBeenCalled();
  });

  it('keeps the event when the IP address is too long for the column, dropping only the IP', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);

    serviceWith(insert).record('auth.login.failed', { ipAddress: '1'.repeat(256) });
    await settle();

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'auth.login.failed',
        ipAddress: null,
      }),
    );
  });

  it('carries the request details a reviewer needs', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const occurredAt = new Date('2026-09-28T03:00:00.000Z');

    serviceWith(insert).record('auth.login.succeeded', {
      userId: 'user-1',
      actorEmail: 'kim@example.com',
      ipAddress: '203.0.113.9',
      userAgent: 'Mozilla/5.0',
      metadata: { jti: 'session-1' },
      occurredAt,
    });
    await settle();

    expect(insert).toHaveBeenCalledWith({
      event: 'auth.login.succeeded',
      occurredAt,
      userId: 'user-1',
      actorEmail: 'kim@example.com',
      ipAddress: '203.0.113.9',
      userAgent: 'Mozilla/5.0',
      metadata: { jti: 'session-1' },
    });
  });
});
