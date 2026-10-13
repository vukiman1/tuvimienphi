import { afterAll, vi } from 'vitest';

const SETTLE_MS = 50;
const noop = (): void => undefined;

globalThis.ResizeObserver ??= class {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
};

window.matchMedia ??= (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: noop,
  removeListener: noop,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => false,
});

afterAll(async () => {
  vi.useRealTimers();
  await new Promise<void>((resolve) => {
    setTimeout(resolve, SETTLE_MS);
  });
});
