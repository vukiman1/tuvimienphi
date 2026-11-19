import { useSyncExternalStore } from 'react';
import { markLessonRead, readLocalProgress, subscribeLocalProgress } from './local-progress-store';

const EMPTY_PROGRESS: ReadonlySet<string> = new Set();

export interface LessonProgress {
  readonly readSlugs: ReadonlySet<string>;
  readonly markRead: (slug: string) => void;
}

export function useLessonProgress(): LessonProgress {
  const readSlugs = useSyncExternalStore(
    subscribeLocalProgress,
    readLocalProgress,
    () => EMPTY_PROGRESS,
  );
  return { readSlugs, markRead: markLessonRead };
}
