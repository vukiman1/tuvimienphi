import type { CanChiIndex } from '@/lib/lunar-calendar';
import { PHU_TINH_RULES, PhuTinhKey, type PhuTinhRule } from '@/lib/tu-vi/phu-tinh-data';
import type { PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';

/**
 * Lưu tinh: tầng sao chạy theo năm đang xem. Đối chiếu với API lưu niên của tuvi.vn trên mười sáu
 * năm xem; ba lá số khác hẳn nhau cho kết quả trùng khít, nên tầng này là hàm thuần của năm xem và
 * không đụng tới lá số gốc.
 */

/**
 * Mười lăm sao dùng lại đúng bảng an của tầng natal, chỉ thay can chi năm sinh bằng can chi năm
 * xem. Không sao nào cần bảng riêng — đó là lý do file này không chép thêm dữ liệu.
 */
const REUSED_NAMES: ReadonlySet<PhuTinhName> = new Set<PhuTinhName>([
  'Thái Tuế',
  'Tang Môn',
  'Bạch Hổ',
  'Kiếp Sát',
  'Thiên Mã',
  'Đào Hoa',
  'Hồng Loan',
  'Thiên Khốc',
  'Thiên Hư',
  'Nguyệt Đức',
  'Thiên Đức',
  'Lộc Tồn',
  'Kình Dương',
  'Thiên Khôi',
  'Thiên Việt',
]);

/**
 * Văn Xương và Văn Khúc là hai sao duy nhất cần bảng riêng: tầng natal an chúng theo giờ sinh, còn
 * tầng lưu an theo can năm xem. Hai bảng soi gương nhau.
 *
 * `null` ở Đinh và Mậu vì tuvi.vn không an hai sao này ở những năm đó — đã kiểm bốn năm can Đinh và
 * Mậu, vắng cả bốn.
 */
const LUU_VAN_XUONG: readonly (number | null)[] = [5, 6, 8, null, null, 9, 11, 0, 2, 3];
const LUU_VAN_KHUC: readonly (number | null)[] = [9, 8, 6, null, null, 5, 3, 2, 0, 11];

function lookupValue(rule: PhuTinhRule, viewYear: CanChiIndex): number {
  switch (rule.key) {
    case PhuTinhKey.YearCan:
      return viewYear.can;
    case PhuTinhKey.YearChi:
      return viewYear.chi;
    default:
      throw new Error(
        `Lưu tinh chỉ an theo can hoặc chi năm xem, còn ${rule.name} an theo ${rule.key}`,
      );
  }
}

function xuongKhucAt(yearCan: number): readonly SaoPlacement<PhuTinhName>[] {
  const pairs = [
    ['Văn Xương', LUU_VAN_XUONG[yearCan]],
    ['Văn Khúc', LUU_VAN_KHUC[yearCan]],
  ] as const;
  return pairs.flatMap(([name, chiIndex]) => (chiIndex === null ? [] : [{ name, chiIndex }]));
}

/** Trụ năm của năm đang xem, không phải của năm sinh. */
export function anLuuTinh(viewYear: CanChiIndex): readonly SaoPlacement<PhuTinhName>[] {
  const reused = PHU_TINH_RULES.filter((rule) => REUSED_NAMES.has(rule.name)).map((rule) => ({
    name: rule.name,
    chiIndex: rule.byValue[lookupValue(rule, viewYear)],
  }));

  return [...reused, ...xuongKhucAt(viewYear.can)];
}
