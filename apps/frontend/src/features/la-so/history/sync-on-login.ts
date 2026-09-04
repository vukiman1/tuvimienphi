import type { LaSoHistoryEntry, SyncLaSoHistoryEntry } from '@org/shared-contracts';
import { laSoHistoryService } from '@/services/la-so-history-service';
import { readLocalHistory, replaceLocalHistory } from './local-history-store';
import { toChartSearch } from './to-chart-search';

/**
 * Carries the charts a visitor viewed before signing in into their account, then mirrors the merged
 * list back into the browser so the two sides agree from that point on.
 */

/** Only the birth details travel: the server derives `birthKey` and rejects being told it. */
function toSyncEntry(entry: LaSoHistoryEntry): SyncLaSoHistoryEntry {
  return { ...toChartSearch(entry), viewedAt: entry.viewedAt };
}

export async function syncLaSoHistoryOnLogin(): Promise<LaSoHistoryEntry[]> {
  const { entries } = await laSoHistoryService.sync(readLocalHistory().map(toSyncEntry));
  replaceLocalHistory(entries);
  return entries;
}
