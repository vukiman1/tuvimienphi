import type { AiProvider } from '@/gql/graphql';
import { formatTime } from '@/lib/format-date-time';
import type { AiHealthView } from '../data/admin-ai.query';
import { answeredBy, friendlyFailure } from './ai-provider-model';

export const HEALTH_INTERVAL_MS = 60_000;
export const MAX_HEALTH_SAMPLES = 30;

const MILLISECONDS_PER_SECOND = 1000;

export type MonitorBadge = 'success' | 'error' | 'processing' | 'warning' | 'default';

export interface MonitorView {
  readonly badge: MonitorBadge;
  readonly headline: string;
  readonly detail: string;
  readonly raw: string | null;
}

export interface MonitorState {
  readonly provider: AiProvider;
  readonly isWatchable: boolean;
  readonly latest: AiHealthView | null;
  readonly requestError: string | null;
}

export interface MonitorClock {
  readonly isWatchable: boolean;
  readonly isOn: boolean;
  readonly isChecking: boolean;
  readonly dueAt: number;
  readonly now: number;
}

function isFresh(health: AiHealthView, now: number): boolean {
  return Date.parse(health.checkedAt) + HEALTH_INTERVAL_MS > now;
}

export function freshSamples(health: AiHealthView | null, now: number): AiHealthView[] {
  return health && isFresh(health, now) ? [health] : [];
}

export function firstDueAt(health: AiHealthView | null, now: number): number {
  return health && isFresh(health, now) ? Date.parse(health.checkedAt) + HEALTH_INTERVAL_MS : now;
}

export function withSample(samples: readonly AiHealthView[], health: AiHealthView): AiHealthView[] {
  return [...samples, health].slice(-MAX_HEALTH_SAMPLES);
}

export function monitorView({
  provider,
  isWatchable,
  latest,
  requestError,
}: MonitorState): MonitorView {
  if (!isWatchable) {
    return {
      badge: 'default',
      headline: 'Chưa theo dõi',
      detail: 'Lưu khoá và model thì thanh này bắt đầu gọi thử liên tục.',
      raw: null,
    };
  }
  if (requestError) {
    return { badge: 'warning', headline: 'Không gọi thử được', detail: requestError, raw: null };
  }
  if (!latest) {
    return {
      badge: 'processing',
      headline: 'Đang gọi thử…',
      detail: 'Lần đầu thường mất vài giây.',
      raw: null,
    };
  }
  if (latest.status === 'OK') {
    return {
      badge: 'success',
      headline: 'Hoạt động tốt',
      detail: `${answeredBy(provider, latest)}, lúc ${formatTime(latest.checkedAt)}.`,
      raw: null,
    };
  }
  return {
    badge: 'error',
    headline: 'Không trả lời được',
    detail: `${friendlyFailure(latest.error)} Gọi thử lúc ${formatTime(latest.checkedAt)}.`,
    raw: latest.error,
  };
}

export function nextCheckLabel({
  isWatchable,
  isOn,
  isChecking,
  dueAt,
  now,
}: MonitorClock): string | null {
  if (!isWatchable) {
    return null;
  }
  if (!isOn) {
    return 'Đã tạm dừng';
  }
  if (isChecking) {
    return 'Đang gọi thử…';
  }
  const seconds = Math.ceil((dueAt - now) / MILLISECONDS_PER_SECOND);
  const longest = HEALTH_INTERVAL_MS / MILLISECONDS_PER_SECOND;
  return `Gọi lại sau ${Math.min(longest, Math.max(0, seconds))} giây`;
}
