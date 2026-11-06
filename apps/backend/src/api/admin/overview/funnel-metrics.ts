import type { PeriodMetric } from './admin-overview.type';
import { fillDays, isoDate, type Window } from './overview-window';

export interface FunnelDayRow {
  readonly day: string;
  readonly chartCasts: number;
  readonly chapterUnlocks: number;
  readonly paidChapterUnlocks: number;
}

export type FunnelColumn = 'chartCasts' | 'chapterUnlocks' | 'paidChapterUnlocks';

function rowsWithin(rows: readonly FunnelDayRow[], window: Window): readonly FunnelDayRow[] {
  const first = isoDate(window.start);
  const afterLast = isoDate(window.end);
  return rows.filter(({ day }) => day >= first && day < afterLast);
}

function total(rows: readonly FunnelDayRow[], column: FunnelColumn): number {
  return rows.reduce((sum, row) => sum + row[column], 0);
}

export function funnelMetric(
  rows: readonly FunnelDayRow[],
  column: FunnelColumn,
  current: Window,
  previous: Window,
): PeriodMetric {
  const currentRows = rowsWithin(rows, current);
  return {
    value: total(currentRows, column),
    previous: total(rowsWithin(rows, previous), column),
    series: fillDays(new Map(currentRows.map((row) => [row.day, row[column]])), current),
  };
}
