import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODULE_URL = pathToFileURL(join(__dirname, 'retry-transient.mjs')).href;
const RUNNER_SCRIPT = `
import { retryTransient, isServerErrorStatus } from ${JSON.stringify(MODULE_URL)};
const script = JSON.parse(process.argv[1]);
const delays = JSON.parse(process.argv[2]);
const waited = [];
let calls = 0;
const attempt = async () => {
  const step = script[Math.min(calls, script.length - 1)];
  calls += 1;
  if (step === 'throw') throw new Error('socket hang up');
  return step;
};
try {
  const status = await retryTransient(attempt, {
    isTransient: isServerErrorStatus,
    delaysMs: delays,
    wait: async (ms) => { waited.push(ms); },
  });
  console.log(JSON.stringify({ status, calls, waited }));
} catch (error) {
  console.log(JSON.stringify({ error: error.message, calls, waited }));
}
`;
const DELAYS_MS: readonly number[] = [1, 2, 3];

type Step = number | 'throw';

interface RunOutcome {
  readonly status?: number;
  readonly error?: string;
  readonly calls: number;
  readonly waited: readonly number[];
}

function run(script: readonly Step[]): RunOutcome {
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', RUNNER_SCRIPT, JSON.stringify(script), JSON.stringify(DELAYS_MS)],
    { encoding: 'utf8' },
  );
  const parsed: unknown = JSON.parse(output);
  return parsed as RunOutcome;
}

describe('retryTransient', () => {
  it('returns the first answer without waiting when the API is healthy', () => {
    expect(run([200])).toEqual({ status: 200, calls: 1, waited: [] });
  });

  it('does not retry a client error, which will not heal by waiting', () => {
    expect(run([404])).toEqual({ status: 404, calls: 1, waited: [] });
  });

  it('waits through 502s while the backend restarts and returns the healthy answer', () => {
    expect(run([502, 502, 200])).toEqual({ status: 200, calls: 3, waited: [1, 2] });
  });

  it('retries a network error the same way as a server error', () => {
    expect(run(['throw', 200])).toEqual({ status: 200, calls: 2, waited: [1] });
  });

  it('hands back the last server error once every delay is spent', () => {
    expect(run([503])).toEqual({ status: 503, calls: 4, waited: [1, 2, 3] });
  });

  it('lets the last network error propagate once every delay is spent', () => {
    expect(run(['throw'])).toEqual({ error: 'socket hang up', calls: 4, waited: [1, 2, 3] });
  });
});
