import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

interface ElementWidth<T extends HTMLElement> {
  readonly ref: RefObject<T | null>;
  readonly width: number | null;
}

export function useElementWidth<T extends HTMLElement>(): ElementWidth<T> {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) {
      return;
    }
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
