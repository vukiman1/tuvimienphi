import type { LoginResponse, LogoutResponse, MeResponse } from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

export const authService = {
  googleOneTap(credential: string) {
    return httpRequest.post<LoginResponse>('/admin/auth/google/one-tap', { credential });
  },
  verifyTwoFactor(challengeToken: string, code: string) {
    return httpRequest.post<LoginResponse>('/admin/auth/2fa/verify', { challengeToken, code });
  },
  logout() {
    return httpRequest.post<LogoutResponse>('/admin/auth/logout');
  },
  me() {
    return httpRequest.get<MeResponse>('/admin/auth/me');
  },
};

export default authService;
