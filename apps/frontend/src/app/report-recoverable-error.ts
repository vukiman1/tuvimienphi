import { reportWarning } from '@/lib/error-reporting';

const HYDRATION_MISMATCH_FINGERPRINT = 'hydration-mismatch';
const RECOVERABLE_ERROR_SAMPLE_RATE = 0.1;

export function reportRecoverableError(error: unknown): void {
  reportWarning(error, {
    fingerprint: [HYDRATION_MISMATCH_FINGERPRINT, window.location.pathname],
    sampleRate: RECOVERABLE_ERROR_SAMPLE_RATE,
  });
}
