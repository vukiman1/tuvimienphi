export enum UptimeStatus {
  Up = 'up',
  Down = 'down',
}

export interface UpState {
  readonly status: UptimeStatus.Up;
  readonly sinceMs: number;
  readonly consecutiveFailures: number;
  readonly failingSinceMs: number | null;
}

export interface DownState {
  readonly status: UptimeStatus.Down;
  readonly sinceMs: number;
}

export type UptimeState = UpState | DownState;

export interface HealthyProbe {
  readonly isHealthy: true;
}

export interface FailedProbe {
  readonly isHealthy: false;
  readonly reason: string;
}

export type ProbeResult = HealthyProbe | FailedProbe;

export function upSince(sinceMs: number): UpState {
  return { status: UptimeStatus.Up, sinceMs, consecutiveFailures: 0, failingSinceMs: null };
}
