import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import type { SaveVanHanEntryInput } from '@/gql/graphql';
import type { VanHanBirthYearOption, VanHanEntryContent } from '../data/admin-van-han.query';

export const DEFAULT_RATING = 3;
export const DEFAULT_BIRTH_YEAR_COUNT = 5;

export interface VanHanAspectValues {
  rating: number;
  body: string;
}

export interface VanHanAgeValues {
  male: string;
  female: string;
}

export interface VanHanFormValues {
  luuNien: string;
  sourceUrl: string;
  luanGiai: VanHanAspectValues[];
  birthYears: number[];
  ages: Record<string, VanHanAgeValues>;
}

export function ageKey(birthYear: number): string {
  return String(birthYear);
}

export function toFormValues(
  entry: VanHanEntryContent | null,
  options: readonly VanHanBirthYearOption[],
): VanHanFormValues {
  if (!entry) {
    return {
      luuNien: '',
      sourceUrl: '',
      luanGiai: VAN_HAN_ASPECTS.map(() => ({ rating: DEFAULT_RATING, body: '' })),
      birthYears: defaultBirthYears(options),
      ages: {},
    };
  }

  return {
    luuNien: entry.luuNien,
    sourceUrl: entry.sourceUrl,
    luanGiai: VAN_HAN_ASPECTS.map((label) => {
      const aspect = entry.luanGiai.find((item) => item.aspect === label);
      return { rating: aspect?.rating ?? DEFAULT_RATING, body: aspect?.body ?? '' };
    }),
    birthYears: entry.tungTuoi.map((age) => age.birthYear),
    ages: Object.fromEntries(
      entry.tungTuoi.map((age) => [ageKey(age.birthYear), { male: age.male, female: age.female }]),
    ),
  };
}

export function copyOfPreviousYear(
  previous: VanHanEntryContent,
  options: readonly VanHanBirthYearOption[],
): VanHanFormValues {
  const copied = toFormValues(previous, options);
  const offered = new Set(options.map((option) => option.birthYear));

  return {
    ...copied,
    sourceUrl: '',
    birthYears: copied.birthYears.filter((birthYear) => offered.has(birthYear)),
  };
}

export function toInput(
  year: number,
  zodiacOrder: number,
  values: VanHanFormValues,
): SaveVanHanEntryInput {
  return {
    year,
    zodiacOrder,
    luuNien: values.luuNien.trim(),
    luanGiai: VAN_HAN_ASPECTS.map((aspect, index) => ({
      aspect,
      rating: values.luanGiai[index]?.rating ?? DEFAULT_RATING,
      body: (values.luanGiai[index]?.body ?? '').trim(),
    })),
    tungTuoi: [...values.birthYears]
      .sort((a, b) => a - b)
      .map((birthYear) => ({
        birthYear,
        male: (values.ages[ageKey(birthYear)]?.male ?? '').trim(),
        female: (values.ages[ageKey(birthYear)]?.female ?? '').trim(),
      })),
    sourceUrl: values.sourceUrl.trim() || null,
  };
}

export function isSameInput(left: SaveVanHanEntryInput, right: SaveVanHanEntryInput): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function defaultBirthYears(options: readonly VanHanBirthYearOption[]): number[] {
  return options
    .filter((option) => option.age > 1)
    .slice(-DEFAULT_BIRTH_YEAR_COUNT)
    .map((option) => option.birthYear);
}
