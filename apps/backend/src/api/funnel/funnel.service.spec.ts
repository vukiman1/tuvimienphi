import { Logger } from '@nestjs/common';
import type { RedisService } from '@org/backend-redis';
import { AllowanceSource } from '../credits/allowance-source.enum';
import type { FunnelDailyStore } from './funnel-daily.store';
import type { FunnelKeyHasher } from './funnel-key-hasher';
import { FunnelMetric } from './funnel-metric.enum';
import { FunnelService } from './funnel.service';

const BIRTH_KEY = '1990-11-05-am-h3-nu';
const MORNING = new Date('2026-11-05T01:00:00Z');

class FakeRedis {
  readonly keys = new Map<string, string>();
  failure: Error | null = null;

  async setIfAbsent(key: string, value: string): Promise<boolean> {
    if (this.failure) throw this.failure;
    if (this.keys.has(key)) return false;
    this.keys.set(key, value);
    return true;
  }
}

class FakeStore {
  readonly counts = new Map<string, number>();

  async increment(day: string, metric: FunnelMetric): Promise<void> {
    const slot = `${day}:${metric}`;
    this.counts.set(slot, (this.counts.get(slot) ?? 0) + 1);
  }

  count(day: string, metric: FunnelMetric): number {
    return this.counts.get(`${day}:${metric}`) ?? 0;
  }
}

const hasher = { hash: (birthKey: string): string => `hashed-${birthKey.length}` };

function build(): { service: FunnelService; redis: FakeRedis; store: FakeStore } {
  const redis = new FakeRedis();
  const store = new FakeStore();
  const service = new FunnelService(
    redis as unknown as RedisService,
    hasher as unknown as FunnelKeyHasher,
    store as unknown as FunnelDailyStore,
  );
  return { service, redis, store };
}

describe('FunnelService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('counts a chart once per UTC day however often it is viewed', async () => {
    const { service, store } = build();

    await service.recordCast(BIRTH_KEY, MORNING);
    await service.recordCast(BIRTH_KEY, MORNING);

    expect(store.count('2026-11-05', FunnelMetric.ChartCast)).toBe(1);
  });

  it('counts the same chart again on the next UTC day', async () => {
    const { service, store } = build();

    await service.recordCast(BIRTH_KEY, new Date('2026-11-05T23:59:00Z'));
    await service.recordCast(BIRTH_KEY, new Date('2026-11-06T00:01:00Z'));

    expect(store.count('2026-11-05', FunnelMetric.ChartCast)).toBe(1);
    expect(store.count('2026-11-06', FunnelMetric.ChartCast)).toBe(1);
  });

  it('ignores keys that birthKey() cannot produce', async () => {
    const { service, redis, store } = build();

    await service.recordCast('abc', MORNING);

    expect(redis.keys.size).toBe(0);
    expect(store.counts.size).toBe(0);
  });

  it('counts a free unlock without counting it as paid', async () => {
    const { service, store } = build();

    await service.recordUnlock(BIRTH_KEY, AllowanceSource.Daily, MORNING);

    expect(store.count('2026-11-05', FunnelMetric.ChapterUnlock)).toBe(1);
    expect(store.count('2026-11-05', FunnelMetric.PaidChapterUnlock)).toBe(0);
  });

  it('counts a credit unlock as both unlock and paid unlock, once per day', async () => {
    const { service, store } = build();

    await service.recordUnlock(BIRTH_KEY, AllowanceSource.Credit, MORNING);
    await service.recordUnlock(BIRTH_KEY, AllowanceSource.Credit, MORNING);

    expect(store.count('2026-11-05', FunnelMetric.ChapterUnlock)).toBe(1);
    expect(store.count('2026-11-05', FunnelMetric.PaidChapterUnlock)).toBe(1);
  });

  it('never sends the raw birth key to Redis', async () => {
    const { service, redis } = build();

    await service.recordCast(BIRTH_KEY, MORNING);
    await service.recordUnlock(BIRTH_KEY, AllowanceSource.Credit, MORNING);

    expect(redis.keys.size).toBe(3);
    for (const key of redis.keys.keys()) expect(key).not.toContain(BIRTH_KEY);
  });

  it('keeps the request alive when Redis fails', async () => {
    const { service, redis, store } = build();
    redis.failure = new Error('connection refused');
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    await expect(service.recordCast(BIRTH_KEY, MORNING)).resolves.toBeUndefined();

    expect(store.counts.size).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]?.[0]);
    expect(message).toContain(FunnelMetric.ChartCast);
    expect(message).toContain('2026-11-05');
    expect(message).not.toContain(BIRTH_KEY);
  });
});
