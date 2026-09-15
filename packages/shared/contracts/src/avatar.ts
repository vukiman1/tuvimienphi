export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_FORM_FIELD = 'avatar';

export enum AvatarMimeType {
  Jpeg = 'image/jpeg',
  Png = 'image/png',
  Webp = 'image/webp',
}

export interface UpdateAvatarResponse {
  avatar: string;
}
