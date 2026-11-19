import type { KienThucSearchItem } from '@org/shared-contracts';
import { KIEN_THUC_SOURCE } from '../kien-thuc-content';

export function loadKienThucSearchIndex(): Promise<readonly KienThucSearchItem[]> {
  return KIEN_THUC_SOURCE.loadSearchIndex();
}
