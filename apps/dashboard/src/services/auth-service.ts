import type { MeResponse } from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';

export const authService = {
  /** Current session + role. Throws if there is no valid session (401). */
  me() {
    return httpRequest.get<MeResponse>('/auth/me');
  },
};

export default authService;
