import { z } from 'zod';

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

/** Each of the twelve two-hour periods a Vietnamese birth time is given in. */
export const BIRTH_HOURS = [
  { chi: 'Tý', range: '23:00 - 00:59' },
  { chi: 'Sửu', range: '01:00 - 02:59' },
  { chi: 'Dần', range: '03:00 - 04:59' },
  { chi: 'Mão', range: '05:00 - 06:59' },
  { chi: 'Thìn', range: '07:00 - 08:59' },
  { chi: 'Tị', range: '09:00 - 10:59' },
  { chi: 'Ngọ', range: '11:00 - 12:59' },
  { chi: 'Mùi', range: '13:00 - 14:59' },
  { chi: 'Thân', range: '15:00 - 16:59' },
  { chi: 'Dậu', range: '17:00 - 18:59' },
  { chi: 'Tuất', range: '19:00 - 20:59' },
  { chi: 'Hợi', range: '21:00 - 22:59' },
] as const;

export type BirthHourChi = (typeof BIRTH_HOURS)[number]['chi'];

const BIRTH_HOUR_VALUES = BIRTH_HOURS.map((hour) => hour.chi) as [BirthHourChi, ...BirthHourChi[]];

export const MIN_BIRTH_YEAR = 1900;
export const MAX_BIRTH_YEAR = new Date().getFullYear();
export const MAX_NAME_LENGTH = 60;
export const DAYS_IN_LONGEST_MONTH = 31;
export const MONTHS_IN_YEAR = 12;

export const birthInputSchema = z.object({
  fullName: z.string().min(1).max(MAX_NAME_LENGTH).optional(),
  day: z.number().int().min(1).max(DAYS_IN_LONGEST_MONTH),
  month: z.number().int().min(1).max(MONTHS_IN_YEAR),
  year: z.number().int().min(MIN_BIRTH_YEAR).max(MAX_BIRTH_YEAR),
  calendar: z.enum(CalendarType),
  hour: z.enum(BIRTH_HOUR_VALUES),
  gender: z.enum(Gender),
});

export type BirthInput = z.infer<typeof birthInputSchema>;

/** Optional throughout: /la-so is reachable directly, without anyone having filled the form. */
export const birthSearchSchema = birthInputSchema.partial();
