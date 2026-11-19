import { useEffect, useState } from 'react';
import { SECTION_PROBE_REM, activeSectionIndex } from './active-section';

const DEFAULT_ROOT_FONT_SIZE_PX = 16;

function rootFontSizePx(): number {
  const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(fontSize) ? fontSize : DEFAULT_ROOT_FONT_SIZE_PX;
}

function sectionTops(sectionIds: readonly string[]): readonly number[] {
  return sectionIds.map(
    (id) => document.getElementById(id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
  );
}

export function useActiveSection(sectionIds: readonly string[]): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      setActiveIndex(
        activeSectionIndex(sectionTops(sectionIds), SECTION_PROBE_REM * rootFontSizePx()),
      );
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
  }, [sectionIds]);

  return activeIndex;
}
