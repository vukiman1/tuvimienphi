const FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';
const PAINT_ENTRY_TYPE = 'paint';

export const FIRST_PAINT_WAIT_LIMIT_MS = 3_000;

function supportsPaintTiming(): boolean {
  return (
    typeof PerformanceObserver !== 'undefined' &&
    Array.isArray(PerformanceObserver.supportedEntryTypes) &&
    PerformanceObserver.supportedEntryTypes.includes(PAINT_ENTRY_TYPE)
  );
}

function firstContentfulPaint(): Promise<void> {
  return new Promise((resolve) => {
    new PerformanceObserver((list, observer) => {
      if (list.getEntriesByName(FIRST_CONTENTFUL_PAINT).length === 0) {
        return;
      }
      observer.disconnect();
      resolve();
    }).observe({ type: PAINT_ENTRY_TYPE, buffered: true });
  });
}

function waitLimit(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, FIRST_PAINT_WAIT_LIMIT_MS);
  });
}

export function whenFirstPainted(): Promise<void> {
  if (!supportsPaintTiming()) {
    return Promise.resolve();
  }
  return Promise.race([firstContentfulPaint(), waitLimit()]);
}
