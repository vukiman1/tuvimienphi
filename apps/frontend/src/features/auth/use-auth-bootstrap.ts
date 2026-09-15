import { useEffect } from 'react';
import type { User } from '@org/shared-contracts';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const { setUser, setInitializing } = useAuthStore.getState();
    try {
      setUser(await resolveSignedInUser());
    } catch (error) {
      console.warn('Could not restore the session; continuing signed out', error);
    } finally {
      setInitializing(false);
    }
  })();

  return bootstrapPromise;
}

async function resolveSignedInUser(): Promise<User | null> {
  const status = await authService.getSessionStatus();
  if (status.user || !status.canRefresh) {
    return status.user;
  }
  await authService.refreshToken();
  const { user } = await authService.getMe();
  return user;
}

export function resetAuthBootstrapForTests(): void {
  bootstrapPromise = null;
}

export function useAuthBootstrap() {
  useEffect(() => {
    void bootstrapAuth();
  }, []);
}
