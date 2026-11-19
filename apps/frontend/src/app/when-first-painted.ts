const FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';
const PAINT_ENTRY_TYPE = 'paint';

export const FIRST_PAINT_WAIT_LIMIT_MS = 3_000;

function supportsPaintTiming(): boolean {
  return (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes.includes(PAINT_ENTRY_TYPE)
  );
}

export function whenFirstPainted(): Promise<void> {
  if (!supportsPaintTiming()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      if (list.getEntriesByName(FIRST_CONTENTFUL_PAINT).length === 0) {
        return;
      }
      stopWaiting();
    });
    const limit = window.setTimeout(() => stopWaiting(), FIRST_PAINT_WAIT_LIMIT_MS);
    function stopWaiting(): void {
      window.clearTimeout(limit);
      observer.disconnect();
      resolve();
    }
    observer.observe({ type: PAINT_ENTRY_TYPE, buffered: true });
  });
}
