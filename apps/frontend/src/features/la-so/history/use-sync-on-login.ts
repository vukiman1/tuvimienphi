import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { selectIsAuthenticated, selectIsInitializing, useAuthStore } from '@/stores/auth-store';
import { laSoHistoryQueryKey } from './use-la-so-history';
import { syncLaSoHistoryOnLogin } from './sync-on-login';

/**
 * Runs the one-off merge the moment a visitor becomes signed in — whether they just logged in or
 * arrived with a session already restored. Mounted once, near the router root.
 */
export function useSyncLaSoHistoryOnLogin(): void {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isInitializing = useAuthStore(selectIsInitializing);
  const queryClient = useQueryClient();
  // Signing out and back in must merge again, so this tracks the state rather than latching once.
  const syncedFor = useRef(false);

  useEffect(() => {
    if (isInitializing) {
      return;
    }
    if (!isAuthenticated) {
      syncedFor.current = false;
      return;
    }
    if (syncedFor.current) {
      return;
    }
    syncedFor.current = true;

    void syncLaSoHistoryOnLogin()
      .then((entries) => {
        queryClient.setQueryData(laSoHistoryQueryKey(true), entries);
      })
      .catch((error: unknown) => {
        console.error('Không đồng bộ được lịch sử lá số sau khi đăng nhập', error);
        syncedFor.current = false;
      });
  }, [isAuthenticated, isInitializing, queryClient]);
}
