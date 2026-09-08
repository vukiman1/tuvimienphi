import type { SaoView } from '../cast-chart.js';
import type { ChinhTinhName } from '../sao-names.js';

export const TO_HOP_VO_CHINH_DIEU = '(vô chính diệu)';

/**
 * Khoá tra bảng nền. Mười bốn chính tinh đều suy từ một mình vị trí Tử Vi nên cả tử vi chỉ có mười
 * hai thế bố trí, và một cung chỉ có ba mươi tám tổ hợp khả dĩ — mười bốn sao đơn và hai mươi bốn
 * cặp đôi, không bao giờ ba sao. Vì thế đơn vị tra là tổ hợp chứ không phải từng sao rời.
 *
 * Xếp theo thứ tự mã ký tự chứ không theo vần tiếng Việt: khoá chỉ cần ổn định, không cần đọc xuôi.
 */
export function toHopKey(chinhTinh: readonly SaoView<ChinhTinhName>[]): string {
  if (chinhTinh.length === 0) {
    return TO_HOP_VO_CHINH_DIEU;
  }
  return chinhTinh
    .map((sao) => sao.name)
    .slice()
    .sort()
    .join(' + ');
}
