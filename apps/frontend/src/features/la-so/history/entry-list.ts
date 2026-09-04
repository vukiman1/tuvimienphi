import type { LaSoHistoryEntry } from '@org/shared-contracts';

/**
 * The ordering rule for a history list, kept in one place because both the browser store and the
 * server cache have to apply it identically — otherwise the list jumps around on sign-in.
 */

export function upsertEntry(
  entries: readonly LaSoHistoryEntry[],
  entry: LaSoHistoryEntry,
  limit?: number,
): LaSoHistoryEntry[] {
  const next = [entry, ...entries.filter((item) => item.birthKey !== entry.birthKey)];
  return limit === undefined ? next : next.slice(0, limit);
}

export function removeEntry(
  entries: readonly LaSoHistoryEntry[],
  birthKey: string,
): LaSoHistoryEntry[] {
  return entries.filter((item) => item.birthKey !== birthKey);
}
