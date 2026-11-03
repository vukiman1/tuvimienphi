import { create } from 'zustand';

interface PendingTwoFactorState {
  readonly challengeToken: string | null;
  readonly setChallengeToken: (challengeToken: string | null) => void;
}

export const usePendingTwoFactor = create<PendingTwoFactorState>()((set) => ({
  challengeToken: null,
  setChallengeToken: (challengeToken) => set({ challengeToken }),
}));
