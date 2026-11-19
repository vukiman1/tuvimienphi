import { useCallback, type RefCallback } from 'react';
import { useLessonProgress } from './use-lesson-progress';

export const READ_VISIBILITY_RATIO = 0.5;

export function useMarkReadOnView(slug: string): RefCallback<HTMLElement> {
  const { markRead } = useLessonProgress();
  return useCallback(
    (element: HTMLElement | null) => {
      if (element === null) {
        return undefined;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.intersectionRatio >= READ_VISIBILITY_RATIO)) {
            return;
          }
          markRead(slug);
          observer.disconnect();
        },
        { threshold: READ_VISIBILITY_RATIO },
      );
      observer.observe(element);
      return () => observer.disconnect();
    },
    [slug, markRead],
  );
}
