import type { VanHanMissingPart } from '@/gql/graphql';
import type { VanHanSlotRow, VanHanYearSummary } from '../data/admin-van-han.query';

export const MIN_VAN_HAN_YEAR = 1900;
export const MAX_VAN_HAN_YEAR = 2200;
export const ZODIAC_COUNT = 12;

export const MISSING_PART_LABEL = {
  LUU_NIEN: 'lưu niên',
  LUAN_GIAI: 'luận giải',
  TUNG_TUOI: 'từng tuổi',
} as const satisfies Record<VanHanMissingPart, string>;

export type SlotStatus = 'EMPTY' | 'INCOMPLETE' | 'COMPLETE';

export interface VanHanSearch {
  readonly year?: number;
}

export function parseYearParam(value: unknown): number | undefined {
  const year = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return isVanHanYear(year) ? year : undefined;
}

export function isVanHanYear(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_VAN_HAN_YEAR &&
    value <= MAX_VAN_HAN_YEAR
  );
}

export function isZodiacOrder(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= ZODIAC_COUNT
  );
}

export function defaultYear(years: readonly VanHanYearSummary[], currentYear: number): number {
  return years.length > 0 ? Math.max(...years.map((summary) => summary.year)) : currentYear;
}

export function yearChoices(
  years: readonly VanHanYearSummary[],
  selectedYear: number,
  currentYear: number,
): number[] {
  const choices = new Set([
    ...years.map((summary) => summary.year),
    currentYear,
    currentYear + 1,
    selectedYear,
  ]);
  return [...choices].sort((a, b) => b - a);
}

export function yearChoiceLabel(year: number, years: readonly VanHanYearSummary[]): string {
  const summary = years.find((candidate) => candidate.year === year);
  if (!summary) {
    return `${year} · chưa có nội dung`;
  }
  return summary.publishedAt
    ? `${year} · đã xuất bản`
    : `${year} · bản nháp ${summary.entryCount}/${ZODIAC_COUNT}`;
}

export function slotStatus(slot: Pick<VanHanSlotRow, 'entry' | 'missing'>): SlotStatus {
  if (!slot.entry) {
    return 'EMPTY';
  }
  return slot.missing.length > 0 ? 'INCOMPLETE' : 'COMPLETE';
}

export function completeCount(slots: readonly Pick<VanHanSlotRow, 'entry' | 'missing'>[]): number {
  return slots.filter((slot) => slotStatus(slot) === 'COMPLETE').length;
}

export function missingLabel(missing: readonly VanHanMissingPart[]): string {
  return missing.map((part) => MISSING_PART_LABEL[part]).join(', ');
}
