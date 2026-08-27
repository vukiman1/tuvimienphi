import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Animate a number from 0 → target once, on mount, with an ease-out curve via rAF so KPI figures
 * "settle" into place. When reduced-motion is requested (or on the server) it starts already at the
 * target — the lazy initial state avoids any synchronous setState in the effect.
 */
export function useCountUp(target: number, durationMs = 1100): number {
  const [value, setValue] = useState(() =>
    typeof window === 'undefined' || prefersReducedMotion() ? target : 0,
  );
  const frame = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs]);

  return value;
}
