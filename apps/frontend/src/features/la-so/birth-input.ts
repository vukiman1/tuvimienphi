import { z } from 'zod';
import {
  BIRTH_HOUR_KEYS,
  CalendarType,
  DAYS_IN_LONGEST_MONTH,
  Gender,
  MAX_NAME_LENGTH,
  MIN_BIRTH_YEAR,
  MONTHS_IN_YEAR,
} from '@org/shared-contracts';
import { convertLunarToSolar, convertSolarToLunar } from '@/lib/lunar-calendar';

/** The birth details a chart is cast from — shared by the form that collects them and /la-so. */

export {
  BIRTH_HOURS,
  BIRTH_HOUR_KEYS,
  CalendarType,
  DAYS_IN_LONGEST_MONTH,
  Gender,
  MAX_NAME_LENGTH,
  MIN_BIRTH_YEAR,
  MONTHS_IN_YEAR,
  birthHourIndex,
  birthKey,
} from '@org/shared-contracts';
export type { BirthHour, BirthHourKey, BirthInput } from '@org/shared-contracts';

export const CALENDAR_LABELS: Readonly<Record<CalendarType, string>> = {
  [CalendarType.Lunar]: 'Âm',
  [CalendarType.Solar]: 'Dương',
};

export const GENDER_LABELS: Readonly<Record<Gender, string>> = {
  [Gender.Male]: 'Nam',
  [Gender.Female]: 'Nữ',
};

export const MAX_BIRTH_YEAR = new Date().getFullYear();

/** Năm xem quyết định nhãn đại vận, cung tháng và tiểu hạn — không đụng tới sao gốc. */
export const MIN_VIEW_YEAR = 1900;
export const MAX_VIEW_YEAR = 2100;

export const INVALID_BIRTH_DATE_MESSAGE = 'Ngày sinh không có trong tháng đã chọn.';

interface BirthDateParts {
  readonly day: number;
  readonly month: number;
  readonly year: number;
  readonly calendar: CalendarType;
}

function isRealSolarDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Lịch âm không có luật "tháng này bao nhiêu ngày" — độ dài do tuần trăng quyết định, và cùng một
 * tháng có năm đủ ba mươi ngày, có năm chỉ hai mươi chín. Đổi sang dương rồi đổi ngược lại: ngày
 * không có thật sẽ tràn sang tháng sau nên không quay về chính nó.
 */
function isRealLunarDate(day: number, month: number, year: number): boolean {
  const solar = convertLunarToSolar({ day, month, year, isLeapMonth: false });
  const back = convertSolarToLunar(solar);
  return back.day === day && back.month === month && back.year === year;
}

export function isRealBirthDate({ day, month, year, calendar }: BirthDateParts): boolean {
  return calendar === CalendarType.Lunar
    ? isRealLunarDate(day, month, year)
    : isRealSolarDate(day, month, year);
}

/** The fields alone, without the "does this date exist" rule — a base for schemas that add to it. */
export const birthFieldsSchema = z.object({
  fullName: z.string().min(1).max(MAX_NAME_LENGTH).optional(),
  day: z.number().int().min(1).max(DAYS_IN_LONGEST_MONTH),
  month: z.number().int().min(1).max(MONTHS_IN_YEAR),
  year: z.number().int().min(MIN_BIRTH_YEAR).max(MAX_BIRTH_YEAR),
  calendar: z.enum(CalendarType),
  hour: z.enum(BIRTH_HOUR_KEYS),
  gender: z.enum(Gender),
});

export const birthInputSchema = birthFieldsSchema.refine(isRealBirthDate, {
  message: INVALID_BIRTH_DATE_MESSAGE,
  path: ['day'],
});

/** Optional throughout: /la-so is reachable directly, without anyone having filled the form. */
export const birthSearchSchema = birthFieldsSchema.partial().extend({
  viewYear: z.number().int().min(MIN_VIEW_YEAR).max(MAX_VIEW_YEAR).optional(),
});
