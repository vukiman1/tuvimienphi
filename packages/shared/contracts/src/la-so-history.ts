import type { BirthInput } from './birth-input.js';

/**
 * A chart the visitor has opened. Identified by `birthKey` rather than a row id: the same shape has
 * to describe entries kept on the server and entries kept in the browser for signed-out visitors,
 * and only `birthKey` exists on both sides.
 */
export interface LaSoHistoryEntry extends BirthInput {
  birthKey: string;
  /** ISO 8601. The list is ordered by this, newest first. */
  viewedAt: string;
}

export interface LaSoHistoryListResponse {
  entries: LaSoHistoryEntry[];
}

export interface RecordLaSoHistoryResponse {
  entry: LaSoHistoryEntry;
}

/**
 * Sent once when a signed-out visitor logs in: merges their local entries and returns the union.
 *
 * Each entry carries its own `viewedAt` so the merge keeps the order the visitor actually browsed
 * in. Stamping them all at merge time would flatten that into one instant.
 */
export interface SyncLaSoHistoryEntry extends BirthInput {
  viewedAt: string;
}

export interface SyncLaSoHistoryPayload {
  entries: SyncLaSoHistoryEntry[];
}

export interface DeleteLaSoHistoryResponse {
  message: string;
}
