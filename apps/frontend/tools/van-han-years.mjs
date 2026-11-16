import {
  isServerErrorStatus,
  retryTransient,
  TRANSIENT_RETRY_DELAYS_MS,
} from './retry-transient.mjs';

const VAN_HAN_YEARS_PATH = '/van-han/years';

export class VanHanYearsError extends Error {
  constructor(url, reason) {
    super(`Could not read the published Vận hạn years from ${url}: ${reason}`);
    this.name = 'VanHanYearsError';
  }
}

function isYearList(value) {
  return Array.isArray(value) && value.every((year) => Number.isInteger(year) && year > 0);
}

export async function fetchPublishedVanHanYears(
  apiBaseUrl,
  retryDelaysMs = TRANSIENT_RETRY_DELAYS_MS,
) {
  const url = `${apiBaseUrl}${VAN_HAN_YEARS_PATH}`;
  let response;
  try {
    response = await retryTransient(() => fetch(url), {
      isTransient: (answer) => isServerErrorStatus(answer.status),
      delaysMs: retryDelaysMs,
      onRetry: ({ delayMs, reason }) =>
        console.warn(`[prerender] ${url}: ${reason}, retrying in ${delayMs} ms`),
    });
  } catch (error) {
    throw new VanHanYearsError(url, `unreachable (${error.cause?.code ?? error.message})`);
  }
  if (!response.ok) {
    throw new VanHanYearsError(url, `answered ${response.status}`);
  }
  const body = await response.json().catch((error) => {
    throw new VanHanYearsError(url, `answered invalid JSON (${error.message})`);
  });
  if (!isYearList(body?.data)) {
    throw new VanHanYearsError(url, `answered ${JSON.stringify(body?.data)}, not a list of years`);
  }
  return body.data;
}
