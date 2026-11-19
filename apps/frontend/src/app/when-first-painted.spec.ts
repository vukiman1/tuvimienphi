import { FIRST_PAINT_WAIT_LIMIT_MS, whenFirstPainted } from './when-first-painted';

type ObserverCallback = (list: { getEntriesByName: (name: string) => readonly unknown[] }) => void;

class FakePaintObserver {
  static readonly supportedEntryTypes: readonly string[] = ['paint'];
  static current: FakePaintObserver | null = null;
  isDisconnected = false;

  constructor(private readonly callback: ObserverCallback) {
    FakePaintObserver.current = this;
  }

  observe(): void {
    return undefined;
  }

  disconnect(): void {
    this.isDisconnected = true;
  }

  report(paintNames: readonly string[]): void {
    this.callback({
      getEntriesByName: (name) => paintNames.filter((paintName) => paintName === name),
    });
  }
}

const ORIGINAL_OBSERVER = globalThis.PerformanceObserver;

function settled(promise: Promise<void>): Promise<boolean> {
  return Promise.race([promise.then(() => true), Promise.resolve().then(() => false)]);
}

describe('whenFirstPainted', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(globalThis, { PerformanceObserver: FakePaintObserver });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.assign(globalThis, { PerformanceObserver: ORIGINAL_OBSERVER });
    FakePaintObserver.current = null;
  });

  it('resolves once the first contentful paint is reported', async () => {
    const painted = whenFirstPainted();
    FakePaintObserver.current?.report(['first-paint']);
    expect(await settled(painted)).toBe(false);

    FakePaintObserver.current?.report(['first-contentful-paint']);

    expect(await settled(painted)).toBe(true);
    expect(FakePaintObserver.current?.isDisconnected).toBe(true);
  });

  it('stops waiting when no paint is reported in time', async () => {
    const painted = whenFirstPainted();

    jest.advanceTimersByTime(FIRST_PAINT_WAIT_LIMIT_MS);

    expect(await settled(painted)).toBe(true);
  });

  it('does not wait where paint timing is not supported', async () => {
    Object.assign(globalThis, { PerformanceObserver: undefined });

    expect(await settled(whenFirstPainted())).toBe(true);
  });
});
