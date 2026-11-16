import { ProbeResult } from './uptime-state';

const MS_PER_SECOND = 1000;
const TIMEOUT_ERROR_NAME = 'TimeoutError';

export async function probeHealth(url: string, timeoutMs: number): Promise<ProbeResult> {
  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
  } catch (error: unknown) {
    return { isHealthy: false, reason: describeFetchError(error, timeoutMs) };
  }

  await response.body?.cancel();
  if (response.ok) {
    return { isHealthy: true };
  }
  return { isHealthy: false, reason: `HTTP ${response.status}` };
}

function describeFetchError(error: unknown, timeoutMs: number): string {
  if (isTimeout(error)) {
    return `không trả lời sau ${timeoutMs / MS_PER_SECOND} s`;
  }
  return `lỗi mạng: ${error instanceof Error ? error.message : String(error)}`;
}

function isTimeout(error: unknown): boolean {
  return (
    (error instanceof DOMException || error instanceof Error) && error.name === TIMEOUT_ERROR_NAME
  );
}
