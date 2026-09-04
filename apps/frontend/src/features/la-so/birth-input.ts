import { z } from 'zod';
import { convertLunarToSolar, convertSolarToLunar } from '@/lib/lunar-calendar';

/** The birth details a chart is cast from — shared by the form that collects them and /la-so. */

export enum CalendarType {
  Lunar = 'am',
  Solar = 'duong',
}

export enum Gender {
  Male = 'nam',
  Female = 'nu',
}

export const CALENDAR_LABELS: Readonly<Record<CalendarType, string>> = {
  [CalendarType.Lunar]: 'Âm',
  [CalendarType.Solar]: 'Dương',
};

export const GENDER_LABELS: Readonly<Record<Gender, string>> = {
  [Gender.Male]: 'Nam',
  [Gender.Female]: 'Nữ',
};

/**
 * The thirteen birth-hour choices, in clock order. Giờ Tý is split in two because it straddles
 * midnight: a birth at 23:00-23:59 already belongs to the NEXT lunar day, so the two halves of the
 * same chi cast different charts.
 */
export const BIRTH_HOURS = [
  { key: 'Tý', range: '00:00 - 00:59', hour: 0 },
  { key: 'Sửu', range: '01:00 - 02:59', hour: 2 },
  { key: 'Dần', range: '03:00 - 04:59', hour: 4 },
  { key: 'Mão', range: '05:00 - 06:59', hour: 6 },
  { key: 'Thìn', range: '07:00 - 08:59', hour: 8 },
  { key: 'Tị', range: '09:00 - 10:59', hour: 10 },
  { key: 'Ngọ', range: '11:00 - 12:59', hour: 12 },
  { key: 'Mùi', range: '13:00 - 14:59', hour: 14 },
  { key: 'Thân', range: '15:00 - 16:59', hour: 16 },
  { key: 'Dậu', range: '17:00 - 18:59', hour: 18 },
  { key: 'Tuất', range: '19:00 - 20:59', hour: 20 },
  { key: 'Hợi', range: '21:00 - 22:59', hour: 22 },
  { key: 'Tý sớm', range: '23:00 - 23:59', hour: 23 },
] as const;

export type BirthHour = (typeof BIRTH_HOURS)[number];
export type BirthHourKey = BirthHour['key'];

const BIRTH_HOUR_VALUES = BIRTH_HOURS.map((hour) => hour.key) as [BirthHourKey, ...BirthHourKey[]];

export const MIN_BIRTH_YEAR = 1900;
export const MAX_BIRTH_YEAR = new Date().getFullYear();
export const MAX_NAME_LENGTH = 60;
export const DAYS_IN_LONGEST_MONTH = 31;
export const MONTHS_IN_YEAR = 12;

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

const birthFields = z.object({
  fullName: z.string().min(1).max(MAX_NAME_LENGTH).optional(),
  day: z.number().int().min(1).max(DAYS_IN_LONGEST_MONTH),
  month: z.number().int().min(1).max(MONTHS_IN_YEAR),
  year: z.number().int().min(MIN_BIRTH_YEAR).max(MAX_BIRTH_YEAR),
  calendar: z.enum(CalendarType),
  hour: z.enum(BIRTH_HOUR_VALUES),
  gender: z.enum(Gender),
});

export const birthInputSchema = birthFields.refine(isRealBirthDate, {
  message: INVALID_BIRTH_DATE_MESSAGE,
  path: ['day'],
});

export type BirthInput = z.infer<typeof birthInputSchema>;

/** Optional throughout: /la-so is reachable directly, without anyone having filled the form. */
export const birthSearchSchema = birthFields.partial().extend({
  viewYear: z.number().int().min(MIN_VIEW_YEAR).max(MAX_VIEW_YEAR).optional(),
});
