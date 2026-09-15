import { AvatarMimeType } from '@org/shared-contracts';

export const AVATAR_KEY_PREFIX = 'avatars';

export const AVATAR_FILE_EXTENSIONS = {
  [AvatarMimeType.Jpeg]: 'jpg',
  [AvatarMimeType.Png]: 'png',
  [AvatarMimeType.Webp]: 'webp',
} as const satisfies Record<AvatarMimeType, string>;

export const AVATAR_UPLOAD_THROTTLE = { default: { limit: 10, ttl: 60_000 } };
