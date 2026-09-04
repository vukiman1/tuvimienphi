import { z } from 'zod';
import { birthKey, type BirthInput, type LaSoHistoryEntry } from '@org/shared-contracts';
import { birthFieldsSchema } from '@/features/la-so/birth-input';
import { removeEntry, upsertEntry } from './entry-list';

/**
 * The chart history of a visitor who is not signed in. Once they sign in the server takes over and
 * this becomes a mirror of it, so nothing here is the only copy of anything.
 */

const STORAGE_KEY = 'tuvimienphi:la-so-history:v1';

/** Far below what the storage quota allows; the list is a shortcut, not an archive. */
export const LOCAL_HISTORY_LIMIT = 50;

const storedEntrySchema = birthFieldsSchema.extend({
  viewedAt: z.iso.datetime(),
});

/**
 * Every access is guarded: Safari in private mode throws on write, extensions and cleaners can
 * leave half-written values behind, and a visitor can edit the entry by hand. None of that may
 * take the page down, so a broken store simply reads as empty.
 */
function readRaw(): unknown {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRaw(entries: LaSoHistoryEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // A visitor who blocks storage still gets a working page, just no history.
  }
}

/** The stored key is advisory — recomputing it means a hand-edited entry cannot desync itself. */
function toEntry(stored: z.infer<typeof storedEntrySchema>): LaSoHistoryEntry {
  return { ...stored, birthKey: birthKey(stored) };
}

/** Parsed one entry at a time: one corrupt record must not cost the visitor all the others. */
export function readLocalHistory(): LaSoHistoryEntry[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => {
    const entry = storedEntrySchema.safeParse(item);
    return entry.success ? [toEntry(entry.data)] : [];
  });
}

export function replaceLocalHistory(entries: LaSoHistoryEntry[]): void {
  writeRaw(entries.slice(0, LOCAL_HISTORY_LIMIT));
}

export function recordLocalHistory(input: BirthInput, now = new Date()): LaSoHistoryEntry[] {
  const entry: LaSoHistoryEntry = {
    ...input,
    birthKey: birthKey(input),
    viewedAt: now.toISOString(),
  };
  const entries = upsertEntry(readLocalHistory(), entry, LOCAL_HISTORY_LIMIT);
  writeRaw(entries);
  return entries;
}

export function removeLocalHistory(key: string): LaSoHistoryEntry[] {
  const entries = removeEntry(readLocalHistory(), key);
  writeRaw(entries);
  return entries;
}

export function clearLocalHistory(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same as writeRaw: a store that refuses us is not an error the visitor can act on.
  }
}
