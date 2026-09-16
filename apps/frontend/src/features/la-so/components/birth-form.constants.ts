import { type SelectOption } from '@/components/ui/select-field';
import {
  BIRTH_HOURS,
  DAYS_IN_LONGEST_MONTH,
  GENDER_LABELS,
  Gender,
  MAX_BIRTH_YEAR,
  MIN_BIRTH_YEAR,
  MONTHS_IN_YEAR,
} from '@/features/la-so/birth-input';

function countingOptions(count: number, from: number): readonly SelectOption<string>[] {
  return Array.from({ length: count }, (_, index) => {
    const value = String(from + index);
    return { value, label: value };
  });
}

export const DAY_OPTIONS = countingOptions(DAYS_IN_LONGEST_MONTH, 1);
export const MONTH_OPTIONS = countingOptions(MONTHS_IN_YEAR, 1);
export const YEAR_OPTIONS = countingOptions(MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1, MIN_BIRTH_YEAR)
  .slice()
  .reverse();

export const GENDER_OPTIONS: readonly SelectOption<Gender | ''>[] = Object.values(Gender).map(
  (value) => ({
    value,
    label: GENDER_LABELS[value],
  }),
);

export const HOUR_OPTIONS: readonly SelectOption<string>[] = BIRTH_HOURS.map((hour) => ({
  value: hour.key,
  label: `${hour.key} (${hour.range})`,
}));
