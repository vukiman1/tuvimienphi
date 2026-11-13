import { type StateCreator, type StoreApi, type UseBoundStore, create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@org/shared-contracts';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface AuthState {
  user: User | null;
  isInitializing: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setInitializing: (value: boolean) => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isInitializing: true,
};

const createAuthState: StateCreator<AuthStore> = (set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  reset: () => set(initialState),
});

export const useAuthStore: UseBoundStore<StoreApi<AuthStore>> = IS_DEVELOPMENT
  ? create<AuthStore>()(devtools(createAuthState, { name: 'auth' }))
  : create<AuthStore>()(createAuthState);

// Selectors — use with `useAuthStore(selectUser)` so the component
// only re-renders when that slice changes.
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.user !== null;
export const selectIsInitializing = (state: AuthStore) => state.isInitializing;
export const selectAuthActions = (state: AuthStore) => ({
  setUser: state.setUser,
  clearUser: state.clearUser,
  setInitializing: state.setInitializing,
  reset: state.reset,
});
