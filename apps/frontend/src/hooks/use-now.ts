import { useSyncExternalStore } from 'react';

const MINUTE_MS = 60_000;
const MINUTES_PER_HOUR = 60;
const TWO_DIGITS = 2;
const RENDERED_AT_DATASET_KEY = 'renderedAt';
const WALL_CLOCK_STAMP_LENGTH = 'YYYY-MM-DDTHH:mm'.length;
const STAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})[+-]\d{2}:\d{2}$/;

function subscribeToNothing(): () => void {
  return () => undefined;
}

function currentMinute(): number {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
}

function twoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

function utcOffset(time: Date): string {
  const minutesEast = -time.getTimezoneOffset();
  const sign = minutesEast < 0 ? '-' : '+';
  const absolute = Math.abs(minutesEast);
  return `${sign}${twoDigits(Math.floor(absolute / MINUTES_PER_HOUR))}:${twoDigits(absolute % MINUTES_PER_HOUR)}`;
}

function wallClockStamp(time: number): string {
  const moment = new Date(time);
  const offsetMs = moment.getTimezoneOffset() * MINUTE_MS;
  const wallClock = new Date(time - offsetMs).toISOString().slice(0, WALL_CLOCK_STAMP_LENGTH);
  return `${wallClock}${utcOffset(moment)}`;
}

function renderedMinute(): number {
  const stamp = STAMP_PATTERN.exec(document.documentElement.dataset[RENDERED_AT_DATASET_KEY] ?? '');
  if (!stamp) {
    return currentMinute();
  }
  const [, year, month, day, hour, minute] = stamp.map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

export function stampRenderTime(): void {
  document.documentElement.dataset[RENDERED_AT_DATASET_KEY] = wallClockStamp(currentMinute());
}

export function useNow(): Date {
  return new Date(useSyncExternalStore(subscribeToNothing, currentMinute, renderedMinute));
}
