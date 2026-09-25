import { isAdmin, useAuthStore } from '@/stores/auth-store';
import { bootstrapAuth } from './bootstrap';

export const LOGIN_PATH = '/login';

export async function ensureSession(): Promise<void> {
  await bootstrapAuth();
}

export function hasConsoleAccess(): boolean {
  return isAdmin(useAuthStore.getState().user);
}
