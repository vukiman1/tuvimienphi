import { FIRST_PAINT_WAIT_LIMIT_MS, whenFirstPainted } from './when-first-painted';

interface PaintEntryList {
  readonly getEntriesByName: (name: string) => readonly unknown[];
}

type ObserverCallback = (list: PaintEntryList, observer: FakePaintObserver) => void;

const FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';

function entryList(paintNames: readonly string[]): PaintEntryList {
  return { getEntriesByName: (name) => paintNames.filter((paintName) => paintName === name) };
}

class FakePaintObserver {
  static supportedEntryTypes: readonly string[] | undefined = ['paint'];
  static bufferedPaints: readonly string[] = [];
  static current: FakePaintObserver | null = null;
  observedWith: PerformanceObserverInit | null = null;
  isDisconnected = false;

  constructor(private readonly callback: ObserverCallback) {
    FakePaintObserver.current = this;
  }

  observe(options: PerformanceObserverInit): void {
    this.observedWith = options;
    if (options.buffered && FakePaintObserver.bufferedPaints.length > 0) {
      this.callback(entryList(FakePaintObserver.bufferedPaints), this);
    }
  }

  disconnect(): void {
    this.isDisconnected = true;
  }

  report(paintNames: readonly string[]): void {
    this.callback(entryList(paintNames), this);
  }
}

const ORIGINAL_OBSERVER = globalThis.PerformanceObserver;

const MICROTASK_TURNS_TO_SETTLE = 5;

async function settled(promise: Promise<void>): Promise<boolean> {
  let isSettled = false;
  void promise.then(() => {
    isSettled = true;
  });
  for (let turn = 0; turn < MICROTASK_TURNS_TO_SETTLE; turn += 1) {
    await Promise.resolve();
  }
  return isSettled;
}

describe('whenFirstPainted', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    FakePaintObserver.supportedEntryTypes = ['paint'];
    FakePaintObserver.bufferedPaints = [];
    Object.assign(globalThis, { PerformanceObserver: FakePaintObserver });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.assign(globalThis, { PerformanceObserver: ORIGINAL_OBSERVER });
    FakePaintObserver.current = null;
  });

  it('asks for paint entries, including the ones already recorded', () => {
    void whenFirstPainted();

    expect(FakePaintObserver.current?.observedWith).toEqual({ type: 'paint', buffered: true });
  });

  it('resolves once the first contentful paint is reported', async () => {
    const painted = whenFirstPainted();
    FakePaintObserver.current?.report(['first-paint']);
    expect(await settled(painted)).toBe(false);

    FakePaintObserver.current?.report([FIRST_CONTENTFUL_PAINT]);

    expect(await settled(painted)).toBe(true);
    expect(FakePaintObserver.current?.isDisconnected).toBe(true);
  });

  it('resolves at once when the page painted before it started waiting', async () => {
    FakePaintObserver.bufferedPaints = ['first-paint', FIRST_CONTENTFUL_PAINT];

    const painted = whenFirstPainted();

    expect(await settled(painted)).toBe(true);
    expect(FakePaintObserver.current?.isDisconnected).toBe(true);
  });

  it('stops waiting when no paint is reported in time', async () => {
    const painted = whenFirstPainted();

    jest.advanceTimersByTime(FIRST_PAINT_WAIT_LIMIT_MS);

    expect(await settled(painted)).toBe(true);
  });

  it('does not wait where there is no PerformanceObserver', async () => {
    Object.assign(globalThis, { PerformanceObserver: undefined });

    expect(await settled(whenFirstPainted())).toBe(true);
  });

  it('does not wait where the observer cannot list its entry types', async () => {
    FakePaintObserver.supportedEntryTypes = undefined;

    expect(await settled(whenFirstPainted())).toBe(true);
  });

  it('does not wait where the observer does not support paint entries', async () => {
    FakePaintObserver.supportedEntryTypes = ['navigation', 'resource'];

    expect(await settled(whenFirstPainted())).toBe(true);
    expect(FakePaintObserver.current).toBeNull();
  });
});
