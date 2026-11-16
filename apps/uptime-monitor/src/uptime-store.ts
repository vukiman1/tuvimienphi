import { UptimeState, UptimeStatus } from './uptime-state';

const UPTIME_STATE_KEY = 'api-readiness';

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export async function readUptimeState(
  store: KeyValueStore,
  fallback: UptimeState,
): Promise<UptimeState> {
  const raw = await store.get(UPTIME_STATE_KEY);
  if (raw === null) {
    return fallback;
  }

  const state = parseUptimeState(raw);
  if (state === null) {
    console.warn(`Ignoring unreadable uptime state under ${UPTIME_STATE_KEY}: ${raw}`);
    return fallback;
  }
  return state;
}

export async function writeUptimeState(store: KeyValueStore, state: UptimeState): Promise<void> {
  await store.put(UPTIME_STATE_KEY, JSON.stringify(state));
}

function parseUptimeState(raw: string): UptimeState | null {
  const value = parseJson(raw);
  if (!isRecord(value) || typeof value.sinceMs !== 'number') {
    return null;
  }
  if (value.status === UptimeStatus.Down) {
    return { status: UptimeStatus.Down, sinceMs: value.sinceMs };
  }
  if (value.status !== UptimeStatus.Up || typeof value.consecutiveFailures !== 'number') {
    return null;
  }

  const failingSinceMs = value.failingSinceMs;
  if (failingSinceMs !== null && typeof failingSinceMs !== 'number') {
    return null;
  }
  return {
    status: UptimeStatus.Up,
    sinceMs: value.sinceMs,
    consecutiveFailures: value.consecutiveFailures,
    failingSinceMs,
  };
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}
