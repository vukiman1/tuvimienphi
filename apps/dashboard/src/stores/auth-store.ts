import { create } from 'zustand';
import type { User } from '@org/shared-contracts';

interface AuthState {
  user: User | null;
  isInitializing: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setInitializing: (value: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isInitializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));

export const selectUser = (state: AuthStore) => state.user;

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);
export function isAdmin(user: User | null): boolean {
  return !!user?.role && ADMIN_ROLES.has(user.role);
}
