import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AVATAR_MAX_BYTES, AvatarMimeType } from '@org/shared-contracts';
import type { MeResponse } from '@org/shared-contracts';
import { notify } from '@/lib/toast';
import { userService } from '@/services/user-service';
import { selectUser, useAuthStore } from '@/stores/auth-store';

export const ACCEPTED_AVATAR_TYPES: readonly string[] = Object.values(AvatarMimeType);

const ME_QUERY_KEY = ['auth', 'me'];
const BYTES_PER_MEGABYTE = 1024 * 1024;

interface AvatarUpload {
  upload: (file: File) => void;
  isUploading: boolean;
}

export function useAvatarUpload(): AvatarUpload {
  const queryClient = useQueryClient();
  const storedUser = useAuthStore(selectUser);
  const setStoredUser = useAuthStore((state) => state.setUser);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: ({ avatar }) => {
      queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, (current) =>
        current ? { user: { ...current.user, avatar } } : current,
      );
      if (storedUser) {
        setStoredUser({ ...storedUser, avatar });
      }
      notify.success('Đã cập nhật ảnh đại diện.');
    },
    onError: () => notify.error('Không thể tải ảnh lên. Vui lòng thử lại.'),
  });

  const upload = (file: File): void => {
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      notify.error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      notify.error(`Ảnh phải nhỏ hơn ${AVATAR_MAX_BYTES / BYTES_PER_MEGABYTE}MB.`);
      return;
    }
    uploadMutation.mutate(file);
  };

  return { upload, isUploading: uploadMutation.isPending };
}
