import type { LunarDate } from '@/lib/lunar-calendar';

const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CHI_RANGES = [
  '23h-1h',
  '1h-3h',
  '3h-5h',
  '5h-7h',
  '7h-9h',
  '9h-11h',
  '11h-13h',
  '13h-15h',
  '15h-17h',
  '17h-19h',
  '19h-21h',
  '21h-23h',
];

const LUC_DIEU = ['Đại An', 'Lưu Niên', 'Tốc Hỷ', 'Xích Khẩu', 'Tiểu Cát', 'Không Vong'] as const;
const GOOD_LUC_DIEU: ReadonlySet<string> = new Set(['Đại An', 'Tốc Hỷ', 'Tiểu Cát']);

const LUC_DIEU_COUNT = 6;
const CHI_COUNT = 12;
const HALF_CHI = 6;

export interface XuatHanhHour {
  readonly chi: string;
  readonly range: string;
}

export interface XuatHanhSlot {
  readonly name: string;
  readonly isGood: boolean;
  readonly hours: readonly [XuatHanhHour, XuatHanhHour];
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function hourAt(chiIndex: number): XuatHanhHour {
  return { chi: CHI[chiIndex], range: CHI_RANGES[chiIndex] };
}

// Lục Diệu (Lục Nhâm đại độn): count from Đại An by lunar month/day to find its
// starting địa chi, then each thời thần occupies that chi and the opposite one.
export function getGioXuatHanh(lunar: LunarDate): readonly XuatHanhSlot[] {
  const tyStartAt = mod(lunar.month + lunar.day - 2, LUC_DIEU_COUNT);
  const daiAnStartChi = mod(HALF_CHI - tyStartAt, LUC_DIEU_COUNT);

  return LUC_DIEU.map((name, index) => {
    const chiIndex = daiAnStartChi + index;
    return {
      name,
      isGood: GOOD_LUC_DIEU.has(name),
      hours: [hourAt(chiIndex), hourAt(mod(chiIndex + HALF_CHI, CHI_COUNT))] as const,
    };
  });
}
