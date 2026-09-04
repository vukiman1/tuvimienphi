/**
 * The birth details a chart is cast from. Shared because the frontend collects them and the
 * backend stores them in the chart history — both need the same closed sets to agree on.
 */

export enum CalendarType {
  Lunar = 'am',
  Solar = 'duong',
}

export enum Gender {
  Male = 'nam',
  Female = 'nu',
}

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

export const BIRTH_HOUR_KEYS = BIRTH_HOURS.map((hour) => hour.key) as [
  BirthHourKey,
  ...BirthHourKey[],
];

export const MIN_BIRTH_YEAR = 1900;

/**
 * A storage sanity bound, not the rule a person sees: the form refuses any year in the future,
 * which moves every January and so cannot be a shared constant. This exists only to keep a
 * nonsense year out of the database column.
 */
export const MAX_STORED_BIRTH_YEAR = 2200;

export const MAX_NAME_LENGTH = 60;
export const DAYS_IN_LONGEST_MONTH = 31;
export const MONTHS_IN_YEAR = 12;

export interface BirthInput {
  fullName?: string;
  day: number;
  month: number;
  year: number;
  calendar: CalendarType;
  hour: BirthHourKey;
  gender: Gender;
}

export function birthHourIndex(hour: BirthHourKey): number {
  return BIRTH_HOURS.findIndex((entry) => entry.key === hour);
}

export function birthHourAt(index: number): BirthHour | undefined {
  return BIRTH_HOURS[index];
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Identifies a chart by the details that change it. The name is deliberately absent: renaming
 * someone must not turn their chart into a second entry.
 *
 * The hour travels as its index rather than its label — `'Tý sớm'` carries diacritics and a space,
 * which survive neither a URL nor a database key without escaping.
 */
export function birthKey({ day, month, year, calendar, hour, gender }: BirthInput): string {
  return `${year}-${pad2(month)}-${pad2(day)}-${calendar}-h${birthHourIndex(hour)}-${gender}`;
}
