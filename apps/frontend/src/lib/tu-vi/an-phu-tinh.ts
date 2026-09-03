import { PHU_TINH_RULES, PhuTinhKey, type PhuTinhRule } from '@/lib/tu-vi/phu-tinh-data';
import type { PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';

export interface PhuTinhParams {
  readonly yearCan: number;
  readonly yearChi: number;
  /** Tháng âm, 1–12. */
  readonly month: number;
  readonly hourChi: number;
}

function lookupIndex(rule: PhuTinhRule, params: PhuTinhParams): number {
  switch (rule.key) {
    case PhuTinhKey.YearCan:
      return params.yearCan;
    case PhuTinhKey.YearChi:
      return params.yearChi;
    case PhuTinhKey.Month:
      // Bảng tháng xếp từ tháng Giêng, còn tham số đếm từ 1.
      return params.month - 1;
    case PhuTinhKey.HourChi:
      return params.hourChi;
  }
}

/** An toàn bộ phụ tinh đã có bảng. Những sao chưa giải được luật thì không có mặt ở đây. */
export function anPhuTinh(params: PhuTinhParams): readonly SaoPlacement<PhuTinhName>[] {
  return PHU_TINH_RULES.map((rule) => ({
    name: rule.name,
    chiIndex: rule.byValue[lookupIndex(rule, params)],
  }));
}
