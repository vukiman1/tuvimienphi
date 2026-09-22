import { useRef, type ChangeEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import type { User } from '@org/shared-contracts';
import { Button } from '@/components/ui/button';
import { ACCEPTED_AVATAR_TYPES, useAvatarUpload } from '../use-avatar-upload';

interface ProfileAvatarProps {
  user: User;
}

export function ProfileAvatar({ user }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useAvatarUpload();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      upload(file);
    }
  };

  return (
    <div className="relative shrink-0">
      {user.avatar ? (
        <img
          alt={user.email}
          className="size-20 rounded-full object-cover shadow-sm ring-4 ring-[#f4ebe1]/50"
          src={user.avatar}
        />
      ) : (
        <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f4ebe1] to-[#e4d5c7] text-2xl font-semibold text-[#904423] shadow-sm ring-4 ring-[#f4ebe1]/50">
          {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
        </span>
      )}

      <Button
        aria-label="Tải ảnh đại diện lên"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        size="icon-sm"
        type="button"
        className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-[#904423] text-white shadow-sm hover:bg-[#7a391e]"
      >
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
      </Button>

      <input
        ref={fileInputRef}
        accept={ACCEPTED_AVATAR_TYPES.join(',')}
        aria-label="Chọn ảnh đại diện"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />
    </div>
  );
}
