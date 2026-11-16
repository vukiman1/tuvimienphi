import { setTimeout as sleep } from 'node:timers/promises';

export const TRANSIENT_RETRY_DELAYS_MS = Object.freeze([5_000, 10_000, 20_000, 40_000, 60_000]);
const FIRST_SERVER_ERROR_STATUS = 500;

export function isServerErrorStatus(status) {
  return status >= FIRST_SERVER_ERROR_STATUS;
}

export async function retryTransient(
  attempt,
  { isTransient, delaysMs = TRANSIENT_RETRY_DELAYS_MS, wait = sleep, onRetry = () => undefined },
) {
  for (const delayMs of delaysMs) {
    let result;
    try {
      result = await attempt();
    } catch (error) {
      onRetry({ delayMs, reason: error.message.split('\n')[0] });
      await wait(delayMs);
      continue;
    }
    if (!isTransient(result)) {
      return result;
    }
    onRetry({ delayMs, reason: 'transient answer' });
    await wait(delayMs);
  }
  return attempt();
}
