import type { AiProvider, AiUsagePurpose } from '@/gql/graphql';
import type { AiUsageDayView } from '../data/admin-ai.query';

export type UsagePeriod = 'TODAY' | 'WEEK' | 'THIRTY_DAYS' | 'MONTH';

export interface DayRange {
  readonly from: string;
  readonly to: string;
}

export interface UsageRow {
  readonly key: string;
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

export interface UsageTotals {
  readonly calls: number;
  readonly failedCalls: number;
  readonly quotaHits: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number;
  readonly unpricedModels: readonly string[];
}

export type BudgetLevel = 'OK' | 'NEAR' | 'OVER';

export interface BudgetStatus {
  readonly percent: number;
  readonly level: BudgetLevel;
}

export const USAGE_PERIODS: readonly UsagePeriod[] = ['TODAY', 'WEEK', 'THIRTY_DAYS', 'MONTH'];

export const USAGE_PERIOD_LABEL = {
  TODAY: 'Hôm nay',
  WEEK: '7 ngày',
  THIRTY_DAYS: '30 ngày',
  MONTH: 'Tháng này',
} as const satisfies Record<UsagePeriod, string>;

export const USAGE_PURPOSE_LABEL = {
  GENERATION: 'Luận giải',
  CHECK: 'Kiểm tra',
} as const satisfies Record<AiUsagePurpose, string>;

const REPORTING_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const MS_PER_DAY = 86_400_000;
const WEEK_DAYS = 7;
const THIRTY_DAYS = 30;
const PERCENT = 100;
const NEAR_BUDGET_PERCENT = 80;
const SMALL_AMOUNT_USD = 1;
const CALL_COST_DECIMALS = 5;

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: REPORTING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const smallUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const callCostFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: CALL_COST_DECIMALS,
  maximumFractionDigits: CALL_COST_DECIMALS,
});

export function reportingDay(at: Date): string {
  return dayFormatter.format(at);
}

export function shiftDay(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function monthStart(day: string): string {
  return `${day.slice(0, 8)}01`;
}

export function periodRange(period: UsagePeriod, today: string): DayRange {
  const starts: Record<UsagePeriod, string> = {
    TODAY: today,
    WEEK: shiftDay(today, 1 - WEEK_DAYS),
    THIRTY_DAYS: shiftDay(today, 1 - THIRTY_DAYS),
    MONTH: monthStart(today),
  };
  return { from: starts[period], to: today };
}

export function fetchRange(today: string): DayRange {
  const month = monthStart(today);
  const thirty = shiftDay(today, 1 - THIRTY_DAYS);
  return { from: month < thirty ? month : thirty, to: today };
}

function isWithin(day: string, { from, to }: DayRange): boolean {
  return day >= from && day <= to;
}

function addCost(sum: number | null, cost: number | null | undefined): number | null {
  return sum === null || cost === null || cost === undefined ? null : sum + cost;
}

export function usageRows(days: readonly AiUsageDayView[], range: DayRange): UsageRow[] {
  const rows = new Map<string, UsageRow>();
  for (const day of days) {
    if (!isWithin(day.day, range)) {
      continue;
    }
    const key = `${day.provider}|${day.model}|${day.purpose}`;
    const current = rows.get(key);
    rows.set(key, {
      key,
      provider: day.provider,
      model: day.model,
      purpose: day.purpose,
      calls: (current?.calls ?? 0) + day.calls,
      failedCalls: (current?.failedCalls ?? 0) + day.failedCalls,
      quotaHits: (current?.quotaHits ?? 0) + day.quotaHits,
      inputTokens: (current?.inputTokens ?? 0) + day.inputTokens,
      outputTokens: (current?.outputTokens ?? 0) + day.outputTokens,
      costUsd: addCost(current ? current.costUsd : 0, day.costUsd),
    });
  }
  return [...rows.values()].sort(
    (a, b) =>
      (b.costUsd ?? 0) - (a.costUsd ?? 0) || b.calls - a.calls || a.key.localeCompare(b.key),
  );
}

export function usageTotals(rows: readonly UsageRow[]): UsageTotals {
  const unpriced = rows
    .filter((row) => row.costUsd === null && row.inputTokens + row.outputTokens > 0)
    .map((row) => row.model);
  return {
    calls: sum(rows, (row) => row.calls),
    failedCalls: sum(rows, (row) => row.failedCalls),
    quotaHits: sum(rows, (row) => row.quotaHits),
    inputTokens: sum(rows, (row) => row.inputTokens),
    outputTokens: sum(rows, (row) => row.outputTokens),
    costUsd: sum(rows, (row) => row.costUsd ?? 0),
    unpricedModels: [...new Set(unpriced)],
  };
}

function sum<T>(items: readonly T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0);
}

export function monthSpend(
  days: readonly AiUsageDayView[],
  today: string,
): Partial<Record<AiProvider, number>> {
  const range = { from: monthStart(today), to: today };
  const spend: Partial<Record<AiProvider, number>> = {};
  for (const day of days) {
    if (isWithin(day.day, range)) {
      spend[day.provider] = (spend[day.provider] ?? 0) + (day.costUsd ?? 0);
    }
  }
  return spend;
}

export function budgetStatus(spentUsd: number, budgetUsd: number | null): BudgetStatus | null {
  if (budgetUsd === null || budgetUsd <= 0) {
    return null;
  }
  const percent = Math.round((spentUsd / budgetUsd) * PERCENT);
  if (percent >= PERCENT) {
    return { percent, level: 'OVER' };
  }
  return { percent, level: percent >= NEAR_BUDGET_PERCENT ? 'NEAR' : 'OK' };
}

export function formatCallCost(value: number): string {
  return callCostFormatter.format(value);
}

export function formatUsd(value: number): string {
  return value > 0 && value < SMALL_AMOUNT_USD
    ? smallUsdFormatter.format(value)
    : usdFormatter.format(value);
}
