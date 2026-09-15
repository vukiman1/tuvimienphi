import { AvatarMimeType } from '@org/shared-contracts';
import { detectAvatarMimeType } from './detect-avatar-mime-type';

const JPEG_BYTES = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG_BYTES = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const WEBP_BYTES = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50,
]);

describe('detectAvatarMimeType', () => {
  it.each([
    ['JPEG', JPEG_BYTES, AvatarMimeType.Jpeg],
    ['PNG', PNG_BYTES, AvatarMimeType.Png],
    ['WebP', WEBP_BYTES, AvatarMimeType.Webp],
  ])('recognises a %s file by its signature', (_label, bytes, expected) => {
    expect(detectAvatarMimeType(bytes)).toBe(expected);
  });

  it('rejects an SVG even when it claims to be an image', () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    expect(detectAvatarMimeType(svg)).toBeNull();
  });

  it('rejects a RIFF container that is not WebP', () => {
    const wav = Uint8Array.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    ]);

    expect(detectAvatarMimeType(wav)).toBeNull();
  });

  it('rejects a file too short to carry a signature', () => {
    expect(detectAvatarMimeType(Uint8Array.from([0xff, 0xd8]))).toBeNull();
  });
});
