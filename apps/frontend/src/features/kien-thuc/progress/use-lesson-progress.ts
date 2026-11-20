import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { learningProgressService } from '@/services/learning-progress-service';
import { LEARNING_PROGRESS_QUERY_KEY } from './learning-progress-query';
import { markLessonRead, readLocalProgress, subscribeLocalProgress } from './local-progress-store';

const EMPTY_PROGRESS: ReadonlySet<string> = new Set();

export interface LessonProgress {
  readonly readSlugs: ReadonlySet<string>;
  readonly markRead: (slug: string) => void;
}

export function useLessonProgress(): LessonProgress {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const queryClient = useQueryClient();

  const deviceSlugs = useSyncExternalStore(
    subscribeLocalProgress,
    readLocalProgress,
    () => EMPTY_PROGRESS,
  );

  const accountQuery = useQuery({
    queryKey: LEARNING_PROGRESS_QUERY_KEY,
    queryFn: async (): Promise<ReadonlySet<string>> =>
      new Set((await learningProgressService.list()).slugs),
    staleTime: Infinity,
    enabled: isAuthenticated,
  });

  const accountSlugs = accountQuery.data ?? EMPTY_PROGRESS;

  const readSlugs = useMemo<ReadonlySet<string>>(() => {
    if (accountSlugs.size === 0) {
      return deviceSlugs;
    }
    if (deviceSlugs.size === 0) {
      return accountSlugs;
    }
    return new Set([...accountSlugs, ...deviceSlugs]);
  }, [accountSlugs, deviceSlugs]);

  const { mutate: saveRead } = useMutation({
    mutationFn: (slug: string) => learningProgressService.save([slug]),
    onMutate: (slug: string) => {
      queryClient.setQueryData<ReadonlySet<string>>(
        LEARNING_PROGRESS_QUERY_KEY,
        (current) => new Set([...(current ?? EMPTY_PROGRESS), slug]),
      );
    },
    onError: (error: unknown, slug: string) => {
      markLessonRead(slug);
      console.error('Không lưu được bài đã đọc vào tài khoản', error);
    },
  });

  const markRead = useCallback(
    (slug: string): void => {
      if (!isAuthenticated) {
        markLessonRead(slug);
        return;
      }
      if (accountSlugs.has(slug)) {
        return;
      }
      saveRead(slug);
    },
    [isAuthenticated, accountSlugs, saveRead],
  );

  return { readSlugs, markRead };
}
