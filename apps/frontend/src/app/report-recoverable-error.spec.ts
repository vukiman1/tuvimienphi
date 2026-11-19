import { reportWarning } from '@/lib/error-reporting';
import { reportRecoverableError } from './report-recoverable-error';

jest.mock('@/lib/error-reporting', () => ({ reportWarning: jest.fn() }));

describe('reportRecoverableError', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('leaves the recovered error in the console for whoever opens it', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mismatch = new Error('Minified React error #418');

    reportRecoverableError(mismatch);

    expect(consoleWarn).toHaveBeenCalledWith(expect.any(String), mismatch);
  });

  it('groups recovered hydration errors per page under one fingerprint', () => {
    const mismatch = new Error('Minified React error #418');
    window.history.pushState({}, '', '/van-han/tuoi-ty');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    reportRecoverableError(mismatch);

    expect(reportWarning).toHaveBeenCalledWith(mismatch, {
      fingerprint: ['hydration-mismatch', '/van-han/tuoi-ty'],
      sampleRate: expect.any(Number),
    });
  });
});
