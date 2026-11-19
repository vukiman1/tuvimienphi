import { useSyncExternalStore } from 'react';

const MINUTE_MS = 60_000;
const RENDERED_AT_DATASET_KEY = 'renderedAt';
const WALL_CLOCK_STAMP_LENGTH = 'YYYY-MM-DDTHH:mm'.length;

function subscribeToNothing(): () => void {
  return () => undefined;
}

function currentMinute(): number {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
}

function wallClockStamp(time: number): string {
  const offsetMs = new Date(time).getTimezoneOffset() * MINUTE_MS;
  return new Date(time - offsetMs).toISOString().slice(0, WALL_CLOCK_STAMP_LENGTH);
}

function renderedMinute(): number {
  const stamped = Date.parse(document.documentElement.dataset[RENDERED_AT_DATASET_KEY] ?? '');
  return Number.isNaN(stamped) ? currentMinute() : stamped;
}

export function stampRenderTime(): void {
  document.documentElement.dataset[RENDERED_AT_DATASET_KEY] = wallClockStamp(currentMinute());
}

export function useNow(): Date {
  return new Date(useSyncExternalStore(subscribeToNothing, currentMinute, renderedMinute));
}
