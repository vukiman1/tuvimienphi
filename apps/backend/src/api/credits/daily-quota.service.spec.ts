import type { RedisService } from '@org/backend-redis';
import type { CreditSettingsService } from './credit-settings.service';
import { DailyQuotaService } from './daily-quota.service';

function buildService(options: { readonly limit: number; readonly stored?: string | null }) {
  const redis = {
    get: jest.fn().mockResolvedValue(options.stored ?? null),
    mGet: jest.fn(),
    eval: jest.fn().mockResolvedValue(1),
  };
  const settings = { dailyChapterQuota: jest.fn().mockResolvedValue(options.limit) };
  return {
    service: new DailyQuotaService(
      redis as unknown as RedisService,
      settings as unknown as CreditSettingsService,
    ),
    redis,
  };
}

describe('DailyQuotaService', () => {
  it('enforces the limit currently saved by admins', async () => {
    const { service, redis } = buildService({ limit: 10 });

    await service.consume('u1');

    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'luan-giai:quota:u1',
      expect.any(Number),
      10,
    );
  });

  it('reports no free lượt left when the limit drops below what was already spent', async () => {
    const { service } = buildService({ limit: 1, stored: '3' });

    await expect(service.status('u1')).resolves.toEqual({ limit: 1, remaining: 0 });
  });

  it('counts a user with no usage today as zero spent', async () => {
    const { service, redis } = buildService({ limit: 3 });
    redis.mGet.mockResolvedValue(['2', null]);

    const used = await service.usedBy(['u1', 'u2']);

    expect([...used]).toEqual([
      ['u1', 2],
      ['u2', 0],
    ]);
  });

  it('skips Redis when there is nobody to look up', async () => {
    const { service, redis } = buildService({ limit: 3 });

    await expect(service.usedBy([])).resolves.toEqual(new Map());
    expect(redis.mGet).not.toHaveBeenCalled();
  });
});
