import { Injectable, Logger } from '@nestjs/common';
import { isBirthKey } from '@org/shared-contracts';
import { RedisService } from '@org/backend-redis';
import { AllowanceSource } from '../credits/allowance-source.enum';
import { FunnelDailyStore } from './funnel-daily.store';
import { FunnelKeyHasher } from './funnel-key-hasher';
import { FunnelMetric } from './funnel-metric.enum';
import { FUNNEL_DEDUP_TTL_SECONDS, FUNNEL_REDIS_PREFIX } from './funnel.constants';

const ISO_DATE_LENGTH = 10;
const DEDUP_MARKER = '1';

function utcDay(now: Date): string {
  return now.toISOString().slice(0, ISO_DATE_LENGTH);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

@Injectable()
export class FunnelService {
  private readonly logger = new Logger(FunnelService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly hasher: FunnelKeyHasher,
    private readonly store: FunnelDailyStore,
  ) {}

  async recordCast(birthKey: string, now: Date = new Date()): Promise<void> {
    await this.record(FunnelMetric.ChartCast, birthKey, now);
  }

  async recordUnlock(
    birthKey: string,
    source: AllowanceSource,
    now: Date = new Date(),
  ): Promise<void> {
    await this.record(FunnelMetric.ChapterUnlock, birthKey, now);
    if (source !== AllowanceSource.Credit) return;
    await this.record(FunnelMetric.PaidChapterUnlock, birthKey, now);
  }

  private async record(metric: FunnelMetric, birthKey: string, now: Date): Promise<void> {
    if (!isBirthKey(birthKey)) return;
    const day = utcDay(now);
    try {
      const dedupKey = `${FUNNEL_REDIS_PREFIX}:${metric}:${day}:${this.hasher.hash(birthKey)}`;
      const isFirstToday = await this.redis.setIfAbsent(
        dedupKey,
        DEDUP_MARKER,
        FUNNEL_DEDUP_TTL_SECONDS,
      );
      if (!isFirstToday) return;
      await this.store.increment(day, metric);
    } catch (error) {
      this.logger.warn(`Funnel ${metric} for ${day} not recorded: ${errorMessage(error)}`);
    }
  }
}
