import type { LoginSucceeded, LogoutResponse, MeResponse } from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

export const authService = {
  googleOneTap(credential: string) {
    return httpRequest.post<LoginSucceeded>('/admin/auth/google/one-tap', { credential });
  },
  logout() {
    return httpRequest.post<LogoutResponse>('/admin/auth/logout');
  },
  me() {
    return httpRequest.get<MeResponse>('/admin/auth/me');
  },
};

export default authService;
