import { CUNG_NAMES, type CungName } from '@org/shared-tu-vi';
import type { CungView } from '@/features/la-so/chart-types';

export class UnknownCungNameError extends Error {
  constructor(readonly viewName: string) {
    super(`no cung is named ${viewName}`);
    this.name = 'UnknownCungNameError';
  }
}

export const CUNG_SLUGS: Readonly<Record<CungName, string>> = {
  Mệnh: 'menh',
  'Phụ Mẫu': 'phu-mau',
  'Phúc Đức': 'phuc-duc',
  'Điền Trạch': 'dien-trach',
  'Quan Lộc': 'quan-loc',
  'Nô Bộc': 'no-boc',
  'Thiên Di': 'thien-di',
  'Tật Ách': 'tat-ach',
  'Tài Bạch': 'tai-bach',
  'Tử Tức': 'tu-tuc',
  'Phu Thê': 'phu-the',
  'Huynh Đệ': 'huynh-de',
};

export function cungNameFromSlug(slug: string | undefined): CungName | null {
  return CUNG_NAMES.find((name) => CUNG_SLUGS[name] === slug) ?? null;
}

export function cungNameOf(view: CungView): CungName {
  const name = CUNG_NAMES.find((candidate) => candidate.toUpperCase() === view.name);
  if (!name) throw new UnknownCungNameError(view.name);
  return name;
}
