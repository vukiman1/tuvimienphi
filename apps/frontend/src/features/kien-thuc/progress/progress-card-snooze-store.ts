export const PROGRESS_CARD_SNOOZE_KEY = 'kien-thuc-progress-card-snoozed-at-v1';

const listeners = new Set<() => void>();
let isTabSyncAttached = false;

function writeRaw(now: number): void {
  try {
    window.localStorage.setItem(PROGRESS_CARD_SNOOZE_KEY, String(now));
  } catch {
    return;
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function readProgressCardSnooze(): number | null {
  try {
    const raw = window.localStorage.getItem(PROGRESS_CARD_SNOOZE_KEY);
    if (raw === null) {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function snoozeProgressCard(now: number): void {
  writeRaw(now);
  notify();
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== null && event.key !== PROGRESS_CARD_SNOOZE_KEY) {
    return;
  }
  notify();
}

export function subscribeProgressCardSnooze(listener: () => void): () => void {
  if (!isTabSyncAttached) {
    window.addEventListener('storage', handleStorageEvent);
    isTabSyncAttached = true;
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
