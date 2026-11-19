export interface IntersectionObserverStub {
  readonly reveal: (element: Element, ratio: number) => void;
  readonly restore: () => void;
}

interface ObserverRecord {
  readonly observer: IntersectionObserver;
  readonly callback: IntersectionObserverCallback;
  readonly elements: Set<Element>;
}

export function stubIntersectionObserver(): IntersectionObserverStub {
  const original = window.IntersectionObserver;
  const records = new Set<ObserverRecord>();

  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds: readonly number[] = [];
    private readonly record: ObserverRecord;

    constructor(callback: IntersectionObserverCallback) {
      this.record = { observer: this, callback, elements: new Set() };
      records.add(this.record);
    }

    observe(element: Element): void {
      this.record.elements.add(element);
    }

    unobserve(element: Element): void {
      this.record.elements.delete(element);
    }

    disconnect(): void {
      this.record.elements.clear();
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  window.IntersectionObserver = StubIntersectionObserver;

  return {
    reveal: (element, ratio) => {
      const bounds = element.getBoundingClientRect();
      const entry: IntersectionObserverEntry = {
        target: element,
        intersectionRatio: ratio,
        isIntersecting: ratio > 0,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        rootBounds: null,
        time: 0,
      };
      records.forEach(({ observer, callback, elements }) => {
        if (elements.has(element)) {
          callback([entry], observer);
        }
      });
    },
    restore: () => {
      window.IntersectionObserver = original;
    },
  };
}
