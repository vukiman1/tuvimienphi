import { type RefObject, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { sectionProgress } from './scroll-progress';

export interface SectionProgress {
  readonly progress: number;
  readonly isLive: boolean;
}

const STILL: SectionProgress = { progress: 1, isLive: false };

export function useSectionProgress(ref: RefObject<HTMLElement | null>): SectionProgress {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [measured, setMeasured] = useState<SectionProgress>(STILL);

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
      setMeasured({ progress: sectionProgress(top, height, window.innerHeight), isLive: true });
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

  return prefersReducedMotion ? STILL : measured;
}
