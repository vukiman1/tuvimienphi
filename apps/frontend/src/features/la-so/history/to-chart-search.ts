import type { BirthInput, LaSoHistoryEntry } from '@org/shared-contracts';

/**
 * The chart lives entirely in the URL, so opening a history entry is just rebuilding that URL.
 * `birthKey` and `viewedAt` stay behind — they describe the entry, not the chart.
 */
export function toChartSearch(entry: LaSoHistoryEntry): BirthInput {
  return {
    ...(entry.fullName ? { fullName: entry.fullName } : {}),
    day: entry.day,
    month: entry.month,
    year: entry.year,
    calendar: entry.calendar,
    hour: entry.hour,
    gender: entry.gender,
  };
}
