import type { CanChiIndex } from '@/lib/lunar-calendar';
import { PHU_TINH_RULES, PhuTinhKey, type PhuTinhRule } from '@/lib/tu-vi/phu-tinh-data';
import type { PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';

/**
 * An lại một nhóm phụ tinh bằng đúng bảng natal nhưng theo một trụ can chi khác trụ năm sinh.
 *
 * Hai tầng phủ lên lá số gốc đều dùng phép này, chỉ khác trụ đưa vào: tầng lưu niên lấy trụ của năm
 * đang xem, tầng lưu đại vận lấy trụ của cung đại vận đang hiệu lực.
 */

function lookupValue(rule: PhuTinhRule, tru: CanChiIndex): number {
  switch (rule.key) {
    case PhuTinhKey.YearCan:
      return tru.can;
    case PhuTinhKey.YearChi:
      return tru.chi;
    default:
      throw new Error(
        `Chỉ an lại được sao theo can hoặc chi, còn ${rule.name} an theo ${rule.key}`,
      );
  }
}

export function anSaoTheoTru(
  names: ReadonlySet<PhuTinhName>,
  tru: CanChiIndex,
): readonly SaoPlacement<PhuTinhName>[] {
  return PHU_TINH_RULES.filter((rule) => names.has(rule.name)).map((rule) => ({
    name: rule.name,
    chiIndex: rule.byValue[lookupValue(rule, tru)],
  }));
}
