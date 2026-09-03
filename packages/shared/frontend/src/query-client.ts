import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-error.js';

const DEFAULT_STALE_TIME_MS = 60_000;
const MAX_RETRIES = 2;

/** Client errors (4xx) won't fix themselves on retry; only retry infrastructure faults. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.statusCode < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

/**
 * Build a React Query client with the app-wide defaults: a short stale window, no refetch on
 * window focus, and retries limited to server/network faults. Each app instantiates its own so the
 * cache is never shared across separately bundled SPAs.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  });
}
