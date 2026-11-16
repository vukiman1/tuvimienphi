import { UptimeStatus, upSince } from './uptime-state';
import { AlertKind, nextUptime } from './uptime-transition';

const UP_SINCE_MS = Date.UTC(2026, 10, 16, 0, 0);
const FIRST_FAILURE_MS = Date.UTC(2026, 10, 16, 7, 0);
const SECOND_FAILURE_MS = Date.UTC(2026, 10, 16, 7, 5);
const RECOVERED_MS = Date.UTC(2026, 10, 16, 8, 10);
const HEALTHY = { isHealthy: true } as const;
const BAD_GATEWAY = { isHealthy: false, reason: 'HTTP 502' } as const;

describe('nextUptime', () => {
  it('stays up without a message while the backend keeps answering', () => {
    const previous = upSince(UP_SINCE_MS);

    expect(nextUptime(previous, HEALTHY, SECOND_FAILURE_MS)).toEqual({
      state: previous,
      alert: null,
    });
  });

  it('counts the first failure without declaring the backend down', () => {
    expect(nextUptime(upSince(UP_SINCE_MS), BAD_GATEWAY, FIRST_FAILURE_MS)).toEqual({
      state: {
        status: UptimeStatus.Up,
        sinceMs: UP_SINCE_MS,
        consecutiveFailures: 1,
        failingSinceMs: FIRST_FAILURE_MS,
      },
      alert: null,
    });
  });

  it('forgets a single failure once the backend answers again', () => {
    const afterOneFailure = nextUptime(upSince(UP_SINCE_MS), BAD_GATEWAY, FIRST_FAILURE_MS).state;

    expect(nextUptime(afterOneFailure, HEALTHY, SECOND_FAILURE_MS)).toEqual({
      state: upSince(UP_SINCE_MS),
      alert: null,
    });
  });

  it('declares the backend down from the first failure on the second failure in a row', () => {
    const afterOneFailure = nextUptime(upSince(UP_SINCE_MS), BAD_GATEWAY, FIRST_FAILURE_MS).state;

    expect(nextUptime(afterOneFailure, BAD_GATEWAY, SECOND_FAILURE_MS)).toEqual({
      state: { status: UptimeStatus.Down, sinceMs: FIRST_FAILURE_MS },
      alert: { kind: AlertKind.Down, reason: 'HTTP 502', downSinceMs: FIRST_FAILURE_MS },
    });
  });

  it('stays down without repeating the message while the backend keeps failing', () => {
    const previous = { status: UptimeStatus.Down, sinceMs: FIRST_FAILURE_MS } as const;

    expect(nextUptime(previous, BAD_GATEWAY, RECOVERED_MS)).toEqual({
      state: previous,
      alert: null,
    });
  });

  it('reports the recovery with how long the backend was down', () => {
    const previous = { status: UptimeStatus.Down, sinceMs: FIRST_FAILURE_MS } as const;

    expect(nextUptime(previous, HEALTHY, RECOVERED_MS)).toEqual({
      state: upSince(RECOVERED_MS),
      alert: {
        kind: AlertKind.Recovered,
        downtimeMs: RECOVERED_MS - FIRST_FAILURE_MS,
        recoveredAtMs: RECOVERED_MS,
      },
    });
  });
});
