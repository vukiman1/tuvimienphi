import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { selectIsAuthenticated, selectIsInitializing, useAuthStore } from '@/stores/auth-store';
import { LEARNING_PROGRESS_QUERY_KEY } from './learning-progress-query';
import { clearLocalProgress } from './local-progress-store';
import { mergeDeviceProgress } from './merge-device-progress';

export function useLearningProgressSync(): void {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isInitializing = useAuthStore(selectIsInitializing);
  const queryClient = useQueryClient();
  const mergedForSignIn = useRef(false);
  const sawSignedIn = useRef(false);

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (isAuthenticated) {
      sawSignedIn.current = true;
      if (mergedForSignIn.current) {
        return;
      }
      mergedForSignIn.current = true;
      void mergeDeviceProgress()
        .then((slugs) => {
          queryClient.setQueryData(LEARNING_PROGRESS_QUERY_KEY, slugs);
        })
        .catch((error: unknown) => {
          console.error('Không đồng bộ được tiến độ học sau khi đăng nhập', error);
          mergedForSignIn.current = false;
        });
      return;
    }

    if (sawSignedIn.current) {
      clearLocalProgress();
      sawSignedIn.current = false;
    }
    mergedForSignIn.current = false;
  }, [isAuthenticated, isInitializing, queryClient]);
}
