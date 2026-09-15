import { AvatarMimeType } from '@org/shared-contracts';

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46] as const;
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50] as const;
const WEBP_SIGNATURE_OFFSET = 8;

export function detectAvatarMimeType(bytes: Uint8Array): AvatarMimeType | null {
  if (hasSignature(bytes, JPEG_SIGNATURE)) {
    return AvatarMimeType.Jpeg;
  }
  if (hasSignature(bytes, PNG_SIGNATURE)) {
    return AvatarMimeType.Png;
  }
  if (
    hasSignature(bytes, RIFF_SIGNATURE) &&
    hasSignature(bytes, WEBP_SIGNATURE, WEBP_SIGNATURE_OFFSET)
  ) {
    return AvatarMimeType.Webp;
  }
  return null;
}

function hasSignature(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}
