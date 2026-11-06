import type { DailyCount } from './admin-overview.type';

export const MS_PER_DAY = 86_400_000;

const ISO_DATE_LENGTH = 10;

export interface Window {
  start: Date;
  end: Date;
  days: number;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, ISO_DATE_LENGTH);
}

export function fillDays(
  countsByDate: ReadonlyMap<string, number>,
  { start, days }: Window,
): DailyCount[] {
  return Array.from({ length: days }, (_, offset) => {
    const date = isoDate(new Date(start.getTime() + offset * MS_PER_DAY));
    return { date, count: countsByDate.get(date) ?? 0 };
  });
}
