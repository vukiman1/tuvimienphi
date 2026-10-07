import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { costUsd } from './ai-pricing';
import type { AiProvider } from './ai-provider';
import { AiUsagePurpose } from './ai-usage-purpose.enum';
import { AiUnavailableError, type ModelAttempt } from './ai.errors';
import type { AiResult } from './ai.types';
import { AiUsageDailyEntity } from './entities/ai-usage-daily.entity';

export interface AiUsageEntry {
  readonly provider: AiProvider;
  readonly model: string;
  readonly purpose: AiUsagePurpose;
  readonly isFailure: boolean;
  readonly isQuotaHit: boolean;
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface AiUsageDay {
  readonly day: string;
  readonly provider: AiProvider;
  readonly model: string;
  readonly purpose: AiUsagePurpose;
  readonly calls: number;
  readonly failedCalls: number;
  readonly quotaHits: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number | null;
}

export const REPORTING_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const MAX_MODEL_LENGTH = 60;
const QUOTA_REFUSAL = /\b429\b|quota|rate.?limit|resource_exhausted|too many requests/i;

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: REPORTING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const UPSERT = `
  INSERT INTO "ai_usage_daily"
    ("day", "provider", "model", "purpose", "calls", "failed_calls", "quota_hits", "input_tokens", "output_tokens")
  VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8)
  ON CONFLICT ("day", "provider", "model", "purpose") DO UPDATE SET
    "calls" = "ai_usage_daily"."calls" + 1,
    "failed_calls" = "ai_usage_daily"."failed_calls" + EXCLUDED."failed_calls",
    "quota_hits" = "ai_usage_daily"."quota_hits" + EXCLUDED."quota_hits",
    "input_tokens" = "ai_usage_daily"."input_tokens" + EXCLUDED."input_tokens",
    "output_tokens" = "ai_usage_daily"."output_tokens" + EXCLUDED."output_tokens"
`;

export function reportingDay(at: Date): string {
  return dayFormatter.format(at);
}

export function isQuotaRefusal(reason: string): boolean {
  return QUOTA_REFUSAL.test(reason);
}

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(
    @InjectRepository(AiUsageDailyEntity)
    private readonly repo: Repository<AiUsageDailyEntity>,
  ) {}

  async track(
    provider: AiProvider,
    purpose: AiUsagePurpose,
    work: () => Promise<AiResult>,
  ): Promise<AiResult> {
    try {
      const result = await work();
      await this.record([
        ...failuresOf(provider, purpose, result.failedAttempts),
        {
          provider,
          purpose,
          model: result.model,
          isFailure: false,
          isQuotaHit: false,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
      ]);
      return result;
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        await this.record(failuresOf(provider, purpose, error.attempts));
      }
      throw error;
    }
  }

  async record(entries: readonly AiUsageEntry[], at: Date = new Date()): Promise<void> {
    const day = reportingDay(at);
    try {
      for (const entry of entries) {
        await this.repo.query(UPSERT, [
          day,
          entry.provider,
          entry.model.slice(0, MAX_MODEL_LENGTH),
          entry.purpose,
          entry.isFailure ? 1 : 0,
          entry.isQuotaHit ? 1 : 0,
          entry.inputTokens,
          entry.outputTokens,
        ]);
      }
    } catch (error) {
      this.logger.warn(
        `AI usage was not recorded: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async daily(from: string, to: string): Promise<AiUsageDay[]> {
    const rows = await this.repo.find({
      where: { day: Between(from, to) },
      order: { day: 'ASC', provider: 'ASC', model: 'ASC', purpose: 'ASC' },
    });
    return rows.map((row) => {
      const inputTokens = Number(row.inputTokens);
      const outputTokens = Number(row.outputTokens);
      return {
        day: row.day,
        provider: row.provider,
        model: row.model,
        purpose: row.purpose,
        calls: row.calls,
        failedCalls: row.failedCalls,
        quotaHits: row.quotaHits,
        inputTokens,
        outputTokens,
        costUsd: costUsd(row.model, row.day, inputTokens, outputTokens),
      };
    });
  }
}

function failuresOf(
  provider: AiProvider,
  purpose: AiUsagePurpose,
  attempts: readonly ModelAttempt[],
): AiUsageEntry[] {
  return attempts.map((attempt) => ({
    provider,
    purpose,
    model: attempt.model,
    isFailure: true,
    isQuotaHit: isQuotaRefusal(attempt.reason),
    inputTokens: 0,
    outputTokens: 0,
  }));
}
