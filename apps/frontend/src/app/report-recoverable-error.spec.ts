import { reportWarning } from '@/lib/error-reporting';
import { reportRecoverableError } from './report-recoverable-error';

jest.mock('@/lib/error-reporting', () => ({ reportWarning: jest.fn() }));

describe('reportRecoverableError', () => {
  it('groups recovered hydration errors per page under one fingerprint', () => {
    const mismatch = new Error('Minified React error #418');
    window.history.pushState({}, '', '/van-han/tuoi-ty');

    reportRecoverableError(mismatch);

    expect(reportWarning).toHaveBeenCalledWith(mismatch, {
      fingerprint: ['hydration-mismatch', '/van-han/tuoi-ty'],
      sampleRate: expect.any(Number),
    });
  });
});
