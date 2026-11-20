import { useMemo, useState, useSyncExternalStore } from 'react';
import type { KienThucManifest } from '@org/shared-contracts';
import { useAuthModal } from '@/features/auth/use-auth-modal';
import { selectIsAuthenticated, selectIsInitializing, useAuthStore } from '@/stores/auth-store';
import { publishedLessons } from '../published-pages';
import { isProgressCardDue } from './progress-card-rule';
import {
  readProgressCardSnooze,
  snoozeProgressCard,
  subscribeProgressCardSnooze,
} from './progress-card-snooze-store';
import { countReadLessons } from './read-lesson-count';
import { useLessonProgress } from './use-lesson-progress';

export enum ProgressCardStatus {
  Hidden = 'hidden',
  Due = 'due',
}

export type ProgressCardState =
  | { readonly status: ProgressCardStatus.Hidden }
  | {
      readonly status: ProgressCardStatus.Due;
      readonly readCount: number;
      readonly totalCount: number;
      readonly signIn: () => void;
      readonly snooze: () => void;
    };

export function useProgressCard(
  manifest: KienThucManifest,
  currentLessonSlug: string | null,
): ProgressCardState {
  const { readSlugs } = useLessonProgress();
  const isSignedIn = useAuthStore(selectIsAuthenticated);
  const isInitializing = useAuthStore(selectIsInitializing);
  const snoozedAt = useSyncExternalStore(
    subscribeProgressCardSnooze,
    readProgressCardSnooze,
    () => null,
  );
  const { open } = useAuthModal();
  const [now] = useState(() => Date.now());

  const lessons = useMemo(() => publishedLessons(manifest), [manifest]);
  const lessonSlugs = useMemo(() => new Set(lessons.map((lesson) => lesson.slug)), [lessons]);

  const readCount = countReadLessons(readSlugs, lessonSlugs, currentLessonSlug);

  const due = isProgressCardDue({
    isAuthResolved: !isInitializing,
    isSignedIn,
    readCount,
    snoozedAt,
    now,
  });

  if (!due) {
    return { status: ProgressCardStatus.Hidden };
  }

  return {
    status: ProgressCardStatus.Due,
    readCount,
    totalCount: lessons.length,
    signIn: () => open('login'),
    snooze: () => snoozeProgressCard(Date.now()),
  };
}
