import { execFile } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const VAN_HAN_YEARS_URL = pathToFileURL(join(__dirname, 'van-han-years.mjs')).href;
const RUNNER_SCRIPT = `
import { fetchPublishedVanHanYears } from ${JSON.stringify(VAN_HAN_YEARS_URL)};
try {
  console.log(JSON.stringify({ years: await fetchPublishedVanHanYears(process.argv[1], JSON.parse(process.argv[2])) }));
} catch (error) {
  console.log(JSON.stringify({ failure: { name: error.name, message: error.message } }));
}
`;
const UNREACHABLE_API_BASE_URL = 'http://127.0.0.1:9/api';
const TEST_RETRY_DELAYS_MS: readonly number[] = [1, 1];

interface FakeAnswer {
  readonly status: number;
  readonly body: string;
}

interface RunnerOutput {
  readonly years?: readonly number[];
  readonly failure?: { readonly name: string; readonly message: string };
}

let server: Server;
let answer: FakeAnswer;
let requestedPaths: string[];

function apiBaseUrl(): string {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error(`fake API is not listening on a TCP port: ${address}`);
  }
  return `http://127.0.0.1:${address.port}/api`;
}

async function fetchYears(baseUrl: string): Promise<RunnerOutput> {
  const { stdout } = await runFile(process.execPath, [
    '--input-type=module',
    '-e',
    RUNNER_SCRIPT,
    baseUrl,
    JSON.stringify(TEST_RETRY_DELAYS_MS),
  ]);
  return JSON.parse(stdout);
}

function envelope(data: unknown): string {
  return JSON.stringify({ statusCode: 200, success: true, data });
}

beforeEach(async () => {
  requestedPaths = [];
  server = createServer((request, response) => {
    requestedPaths.push(request.url ?? '');
    response.writeHead(answer.status, { 'content-type': 'application/json' });
    response.end(answer.body);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('fetchPublishedVanHanYears', () => {
  it('reads the published years from the API', async () => {
    answer = { status: 200, body: envelope([2027, 2026]) };

    expect(await fetchYears(apiBaseUrl())).toEqual({ years: [2027, 2026] });
    expect(requestedPaths).toEqual(['/api/van-han/years']);
  });

  it('fails naming the URL and status when the API refuses', async () => {
    answer = { status: 429, body: '{}' };

    expect((await fetchYears(apiBaseUrl())).failure).toEqual({
      name: 'VanHanYearsError',
      message: expect.stringMatching(/\/api\/van-han\/years: answered 429/),
    });
  });

  it('keeps asking while the backend answers 5xx, then reports the last status', async () => {
    answer = { status: 502, body: '{}' };

    expect((await fetchYears(apiBaseUrl())).failure).toEqual({
      name: 'VanHanYearsError',
      message: expect.stringMatching(/\/api\/van-han\/years: answered 502/),
    });
    expect(requestedPaths).toHaveLength(TEST_RETRY_DELAYS_MS.length + 1);
  });

  it('fails naming the URL when the API answers something other than a list of years', async () => {
    answer = { status: 200, body: envelope(['2026']) };

    expect((await fetchYears(apiBaseUrl())).failure).toEqual({
      name: 'VanHanYearsError',
      message: expect.stringContaining('/api/van-han/years'),
    });
  });

  it('fails naming the URL when the API cannot be reached', async () => {
    expect((await fetchYears(UNREACHABLE_API_BASE_URL)).failure).toEqual({
      name: 'VanHanYearsError',
      message: expect.stringContaining(`${UNREACHABLE_API_BASE_URL}/van-han/years`),
    });
  });
});
