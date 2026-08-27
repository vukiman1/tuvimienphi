import type { User } from '@org/shared-contracts';
import { env } from '@/config/env';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

/**
 * A stand-in admin used only in local development so the console is fully viewable without a running
 * backend or a seeded admin account. It is NEVER used in a production build — there the real
 * `/auth/me` session decides access.
 */
const DEV_ADMIN: User = {
  email: 'admin@tuvi.local',
  displayName: 'Quản trị viên',
  role: 'SUPER_ADMIN',
  isEmailVerified: true,
};

// Resolve the session once and share the promise so concurrent route loads don't each hit /auth/me.
let bootstrapPromise: Promise<void> | null = null;

async function resolveSession(): Promise<void> {
  const { setUser, setInitializing } = useAuthStore.getState();
  try {
    const { user } = await authService.me();
    setUser(user);
  } catch {
    // No session (or backend unreachable). In dev, fall back to a mock admin so the UI is usable.
    setUser(env.isDev ? DEV_ADMIN : null);
  } finally {
    setInitializing(false);
  }
}

export function bootstrapAuth(): Promise<void> {
  bootstrapPromise ??= resolveSession();
  return bootstrapPromise;
}
