import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { currentAiCallContext, type AiCallContext } from './ai-call-context';
import { AiCallStatus } from './ai-call-status.enum';
import { costUsd } from './ai-pricing';
import type { AiProvider } from './ai-provider';
import { AiUsagePurpose } from './ai-usage-purpose.enum';
import { AiUnavailableError, type ModelAttempt } from './ai.errors';
import type { AiResult } from './ai.types';
import { AiCallEntity } from './entities/ai-call.entity';
import { AiUsageDailyEntity } from './entities/ai-usage-daily.entity';

export interface AiUsageEntry {
  readonly provider: AiProvider;
  readonly model: string;
  readonly purpose: AiUsagePurpose;
  readonly isFailure: boolean;
  readonly isQuotaHit: boolean;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly latencyMs: number | null;
  readonly error: string | null;
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

export interface AiCallFilter {
  readonly from: string;
  readonly to: string;
  readonly provider: AiProvider;
  readonly model: string;
  readonly purpose: AiUsagePurpose;
}

export interface AiCall {
  readonly id: string;
  readonly at: Date;
  readonly provider: AiProvider;
  readonly model: string;
  readonly purpose: AiUsagePurpose;
  readonly status: AiCallStatus;
  readonly isQuotaHit: boolean;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly latencyMs: number | null;
  readonly costUsd: number | null;
  readonly error: string | null;
  readonly label: string | null;
  readonly userEmail: string | null;
}

export interface AiCallPage {
  readonly items: AiCall[];
  readonly total: number;
}

export interface AiCallRow {
  readonly id: string;
  readonly created_at: Date;
  readonly day: string;
  readonly provider: AiProvider;
  readonly model: string;
  readonly purpose: AiUsagePurpose;
  readonly status: AiCallStatus;
  readonly is_quota_hit: boolean;
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly latency_ms: number | null;
  readonly error: string | null;
  readonly label: string | null;
  readonly user_email: string | null;
}

export const REPORTING_TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const CALL_RETENTION_DAYS = 90;

const MS_PER_DAY = 86_400_000;
const PRUNE_EVERY_MS = 6 * 60 * 60 * 1000;
const MAX_MODEL_LENGTH = 60;
const MAX_LABEL_LENGTH = 60;
const MAX_ERROR_LENGTH = 300;
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

const CALL_COLUMNS = [
  'call.id AS id',
  'call.created_at AS created_at',
  `to_char(call.day, 'YYYY-MM-DD') AS day`,
  'call.provider AS provider',
  'call.model AS model',
  'call.purpose AS purpose',
  'call.status AS status',
  'call.is_quota_hit AS is_quota_hit',
  'call.input_tokens AS input_tokens',
  'call.output_tokens AS output_tokens',
  'call.latency_ms AS latency_ms',
  'call.error AS error',
  'call.label AS label',
  'person.email AS user_email',
];

export function reportingDay(at: Date): string {
  return dayFormatter.format(at);
}

export function isQuotaRefusal(reason: string): boolean {
  return QUOTA_REFUSAL.test(reason);
}

export function toAiCall(row: AiCallRow): AiCall {
  return {
    id: row.id,
    at: row.created_at,
    provider: row.provider,
    model: row.model,
    purpose: row.purpose,
    status: row.status,
    isQuotaHit: row.is_quota_hit,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    latencyMs: row.latency_ms,
    costUsd:
      row.status === AiCallStatus.OK
        ? costUsd(row.model, row.day, row.input_tokens, row.output_tokens)
        : null,
    error: row.error,
    label: row.label,
    userEmail: row.user_email,
  };
}

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);
  private prunedAt = 0;

  constructor(
    @InjectRepository(AiUsageDailyEntity)
    private readonly repo: Repository<AiUsageDailyEntity>,
    @InjectRepository(AiCallEntity)
    private readonly callRepo: Repository<AiCallEntity>,
  ) {}

  async track(
    provider: AiProvider,
    purpose: AiUsagePurpose,
    work: () => Promise<AiResult>,
  ): Promise<AiResult> {
    const context = currentAiCallContext();
    try {
      const result = await work();
      await this.record(
        [
          ...failuresOf(provider, purpose, result.failedAttempts),
          {
            provider,
            purpose,
            model: result.model,
            isFailure: false,
            isQuotaHit: false,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            latencyMs: result.latencyMs ?? null,
            error: null,
          },
        ],
        context,
      );
      return result;
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        await this.record(failuresOf(provider, purpose, error.attempts), context);
      }
      throw error;
    }
  }

  async record(
    entries: readonly AiUsageEntry[],
    context: AiCallContext = {},
    at: Date = new Date(),
  ): Promise<void> {
    const day = reportingDay(at);
    try {
      for (const entry of entries) {
        const model = entry.model.slice(0, MAX_MODEL_LENGTH);
        await this.repo.query(UPSERT, [
          day,
          entry.provider,
          model,
          entry.purpose,
          entry.isFailure ? 1 : 0,
          entry.isQuotaHit ? 1 : 0,
          entry.inputTokens,
          entry.outputTokens,
        ]);
        await this.callRepo.insert({
          createdAt: at,
          day,
          provider: entry.provider,
          model,
          purpose: entry.purpose,
          status: entry.isFailure ? AiCallStatus.FAILED : AiCallStatus.OK,
          isQuotaHit: entry.isQuotaHit,
          inputTokens: entry.inputTokens,
          outputTokens: entry.outputTokens,
          latencyMs: entry.latencyMs,
          error: entry.error?.slice(0, MAX_ERROR_LENGTH) ?? null,
          label: context.label?.slice(0, MAX_LABEL_LENGTH) ?? null,
          userId: context.userId ?? null,
        });
      }
      await this.pruneWhenDue(at);
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

  async calls(filter: AiCallFilter, page: number, limit: number): Promise<AiCallPage> {
    const query = this.callRepo
      .createQueryBuilder('call')
      .leftJoin('users', 'person', 'person.id = call.user_id')
      .where('call.day BETWEEN :from AND :to', { from: filter.from, to: filter.to })
      .andWhere('call.provider = :provider', { provider: filter.provider })
      .andWhere('call.model = :model', { model: filter.model })
      .andWhere('call.purpose = :purpose', { purpose: filter.purpose });

    const [total, rows] = await Promise.all([
      query.getCount(),
      query
        .clone()
        .select(CALL_COLUMNS)
        .orderBy('call.created_at', 'DESC')
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany<AiCallRow>(),
    ]);
    return { items: rows.map(toAiCall), total };
  }

  private async pruneWhenDue(at: Date): Promise<void> {
    if (at.getTime() - this.prunedAt < PRUNE_EVERY_MS) {
      return;
    }
    this.prunedAt = at.getTime();
    await this.callRepo.delete({
      createdAt: LessThan(new Date(at.getTime() - CALL_RETENTION_DAYS * MS_PER_DAY)),
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
    latencyMs: attempt.latencyMs ?? null,
    error: attempt.reason,
  }));
}
