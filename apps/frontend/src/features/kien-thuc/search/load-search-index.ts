import type { KienThucSearchItem } from '@org/shared-contracts';

export async function loadKienThucSearchIndex(): Promise<readonly KienThucSearchItem[]> {
  const { KIEN_THUC_SOURCE } = await import('../kien-thuc-content');
  return KIEN_THUC_SOURCE.loadSearchIndex();
}
