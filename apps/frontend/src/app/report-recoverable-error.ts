import { reportWarning } from '@/lib/error-reporting';

const HYDRATION_MISMATCH_FINGERPRINT = 'hydration-mismatch';
const RECOVERABLE_ERROR_SAMPLE_RATE = 0.1;
const RECOVERED_LOG_PREFIX = 'Recovered from a render error';

export function reportRecoverableError(error: unknown): void {
  console.warn(RECOVERED_LOG_PREFIX, error);
  reportWarning(error, {
    fingerprint: [HYDRATION_MISMATCH_FINGERPRINT, window.location.pathname],
    sampleRate: RECOVERABLE_ERROR_SAMPLE_RATE,
  });
}
