import { isContentSlug } from '@org/shared-contracts';

export const LOCAL_PROGRESS_KEY = 'kien-thuc-progress-v1';
export const LOCAL_PROGRESS_LIMIT = 200;

let readOrder: readonly string[] | null = null;
let snapshot: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function readRaw(): unknown {
  try {
    const raw = window.localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw === null ? [] : JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRaw(slugs: readonly string[]): void {
  try {
    window.localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(slugs));
  } catch {
    return;
  }
}

function removeRaw(): void {
  try {
    window.localStorage.removeItem(LOCAL_PROGRESS_KEY);
  } catch {
    return;
  }
}

function parseSlugs(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const valid = raw.filter(
    (item): item is string => typeof item === 'string' && isContentSlug(item),
  );
  return [...new Set(valid)].slice(-LOCAL_PROGRESS_LIMIT);
}

function replaceOrder(slugs: readonly string[]): void {
  readOrder = slugs;
  snapshot = new Set(slugs);
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function readLocalProgress(): ReadonlySet<string> {
  if (readOrder === null) {
    replaceOrder(parseSlugs(readRaw()));
  }
  return snapshot;
}

export function markLessonRead(slug: string): void {
  if (!isContentSlug(slug) || readLocalProgress().has(slug)) {
    return;
  }
  const next = [...(readOrder ?? []), slug].slice(-LOCAL_PROGRESS_LIMIT);
  replaceOrder(next);
  writeRaw(next);
  notify();
}

export function clearLocalProgress(): void {
  replaceOrder([]);
  removeRaw();
  notify();
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== null && event.key !== LOCAL_PROGRESS_KEY) {
    return;
  }
  replaceOrder(parseSlugs(readRaw()));
  notify();
}

export function subscribeLocalProgress(listener: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener('storage', handleStorageEvent);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}
