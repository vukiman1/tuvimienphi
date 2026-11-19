import * as Sentry from '@sentry/react';
import { reportWarning } from './error-reporting';

jest.mock('@sentry/react', () => ({ captureException: jest.fn() }));
jest.mock('@/config/app-config', () => ({
  appConfig: { app: { environment: 'test' }, sentry: { dsn: 'https://key@sentry.invalid/1' } },
}));

const FINGERPRINT: readonly string[] = ['hydration-mismatch', '/kien-thuc'];
const SAMPLE_RATE = 0.1;

async function flushSentryImport(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('reportWarning', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.mocked(Sentry.captureException).mockClear();
  });

  it('sends a sampled-in warning with its fingerprint', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(SAMPLE_RATE / 2);
    const mismatch = new Error('Hydration failed');

    reportWarning(mismatch, { fingerprint: FINGERPRINT, sampleRate: SAMPLE_RATE });
    await flushSentryImport();

    expect(Sentry.captureException).toHaveBeenCalledWith(mismatch, {
      level: 'warning',
      fingerprint: [...FINGERPRINT],
    });
  });

  it('drops a warning that falls outside the sample', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(SAMPLE_RATE * 2);

    reportWarning(new Error('Hydration failed'), {
      fingerprint: FINGERPRINT,
      sampleRate: SAMPLE_RATE,
    });
    await flushSentryImport();

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
