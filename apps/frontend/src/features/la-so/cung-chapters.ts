import type { CungName } from '@org/shared-tu-vi';

export const CHAPTER_FOR_CUNG: Readonly<Partial<Record<CungName, string>>> = {
  Mệnh: '02',
  'Quan Lộc': '03',
  'Tài Bạch': '04',
  'Phu Thê': '05',
  'Phụ Mẫu': '05',
  'Tử Tức': '05',
};

export function hasQuickLuan(cung: CungName): boolean {
  return CHAPTER_FOR_CUNG[cung] !== undefined;
}
