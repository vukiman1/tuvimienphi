import { queryOptions } from '@tanstack/react-query';
import { httpRequest } from '@/lib/http-request';
import { AVATAR_FORM_FIELD } from '@org/shared-contracts';
import type { UpdateAvatarResponse, UserCredit } from '@org/shared-contracts';

const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' };

export const userService = {
  getCredit() {
    return httpRequest.get<UserCredit>('/user/credit');
  },
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append(AVATAR_FORM_FIELD, file);
    return httpRequest.put<UpdateAvatarResponse>('/user/avatar', formData, {
      headers: MULTIPART_HEADERS,
    });
  },
};

export const userQueries = {
  credit: () =>
    queryOptions({
      queryKey: ['user', 'credit'],
      queryFn: () => userService.getCredit(),
    }),
};

export default userService;
