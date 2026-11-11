import { type RefObject, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { sectionProgress } from './scroll-progress';

const FINAL_PROGRESS = 1;

export function useSectionProgress(ref: RefObject<HTMLElement | null>): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      const element = ref.current;
      if (element === null) {
        return;
      }
      const { top, height } = element.getBoundingClientRect();
      setProgress(sectionProgress(top, height, window.innerHeight));
    };
    const schedule = (): void => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [prefersReducedMotion, ref]);

  return prefersReducedMotion || progress === null ? FINAL_PROGRESS : progress;
}
