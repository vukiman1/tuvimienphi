import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

let bootstrapPromise: Promise<void> | null = null;

async function resolveSession(): Promise<void> {
  const { setUser, setInitializing } = useAuthStore.getState();
  try {
    const { user } = await authService.me();
    setUser(user);
  } catch {
    setUser(null);
  } finally {
    setInitializing(false);
  }
}

export function bootstrapAuth(): Promise<void> {
  bootstrapPromise ??= resolveSession();
  return bootstrapPromise;
}

export function resetAuthBootstrap(): void {
  bootstrapPromise = null;
}
