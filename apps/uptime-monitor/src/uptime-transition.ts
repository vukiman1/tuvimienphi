import {
  DownState,
  ProbeResult,
  UpState,
  UptimeState,
  UptimeStatus,
  upSince,
} from './uptime-state';

export const FAILURES_BEFORE_DOWN = 2;

export enum AlertKind {
  Down = 'down',
  Recovered = 'recovered',
}

export interface DownAlert {
  readonly kind: AlertKind.Down;
  readonly reason: string;
  readonly downSinceMs: number;
}

export interface RecoveredAlert {
  readonly kind: AlertKind.Recovered;
  readonly downtimeMs: number;
  readonly recoveredAtMs: number;
}

export type UptimeAlert = DownAlert | RecoveredAlert;

export interface UptimeTransition {
  readonly state: UptimeState;
  readonly alert: UptimeAlert | null;
}

export function nextUptime(
  previous: UptimeState,
  probe: ProbeResult,
  checkedAtMs: number,
): UptimeTransition {
  if (previous.status === UptimeStatus.Down) {
    return nextFromDown(previous, probe, checkedAtMs);
  }
  return nextFromUp(previous, probe, checkedAtMs);
}

function nextFromDown(
  previous: DownState,
  probe: ProbeResult,
  checkedAtMs: number,
): UptimeTransition {
  if (!probe.isHealthy) {
    return { state: previous, alert: null };
  }
  return {
    state: upSince(checkedAtMs),
    alert: {
      kind: AlertKind.Recovered,
      downtimeMs: checkedAtMs - previous.sinceMs,
      recoveredAtMs: checkedAtMs,
    },
  };
}

function nextFromUp(previous: UpState, probe: ProbeResult, checkedAtMs: number): UptimeTransition {
  if (probe.isHealthy) {
    return { state: { ...previous, consecutiveFailures: 0, failingSinceMs: null }, alert: null };
  }

  const consecutiveFailures = previous.consecutiveFailures + 1;
  const failingSinceMs = previous.failingSinceMs ?? checkedAtMs;
  if (consecutiveFailures < FAILURES_BEFORE_DOWN) {
    return { state: { ...previous, consecutiveFailures, failingSinceMs }, alert: null };
  }

  return {
    state: { status: UptimeStatus.Down, sinceMs: failingSinceMs },
    alert: { kind: AlertKind.Down, reason: probe.reason, downSinceMs: failingSinceMs },
  };
}
