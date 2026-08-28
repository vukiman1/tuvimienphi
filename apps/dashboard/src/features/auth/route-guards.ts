import { isAdmin, useAuthStore } from '@/stores/auth-store';
import { bootstrapAuth } from './bootstrap';

/**
 * Gate the whole console: restore the session, then require an admin role. Rather than throwing a
 * redirect (there is nowhere in-app to send a non-admin), we surface an access screen from the root
 * component based on the resolved store state. This loader just guarantees the session is resolved
 * before the tree renders.
 */
export async function ensureSession(): Promise<void> {
  await bootstrapAuth();
}

export function hasConsoleAccess(): boolean {
  return isAdmin(useAuthStore.getState().user);
}
