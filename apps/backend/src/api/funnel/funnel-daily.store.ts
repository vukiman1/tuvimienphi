import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunnelDailyEntity } from './entities/funnel-daily.entity';
import { FunnelMetric } from './funnel-metric.enum';

const FUNNEL_DAILY_COLUMN = {
  [FunnelMetric.ChartCast]: 'chart_casts',
  [FunnelMetric.ChapterUnlock]: 'chapter_unlocks',
  [FunnelMetric.PaidChapterUnlock]: 'paid_chapter_unlocks',
} as const satisfies Record<FunnelMetric, string>;

function incrementSql(metric: FunnelMetric): string {
  const column = FUNNEL_DAILY_COLUMN[metric];
  return `INSERT INTO "funnel_daily" ("day", "${column}") VALUES ($1, 1)
    ON CONFLICT ("day") DO UPDATE SET "${column}" = "funnel_daily"."${column}" + 1`;
}

@Injectable()
export class FunnelDailyStore {
  constructor(
    @InjectRepository(FunnelDailyEntity)
    private readonly repo: Repository<FunnelDailyEntity>,
  ) {}

  async increment(day: string, metric: FunnelMetric): Promise<void> {
    await this.repo.query(incrementSql(metric), [day]);
  }
}
