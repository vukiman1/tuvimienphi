import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';

const SPAN_YEARS = 120;

interface ViewYearPickerProps {
  readonly birthYear: number;
  readonly value: number;
  readonly onChange: (year: number) => void;
}

export function ViewYearPicker({ birthYear, value, onChange }: ViewYearPickerProps): ReactElement {
  const firstYear = Math.min(birthYear, value);
  const lastYear = Math.max(birthYear + SPAN_YEARS - 1, value);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);

  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-sm text-day-soft">Năm xem</span>
      <select
        aria-label="Năm xem"
        className={cn(
          'cursor-pointer appearance-none rounded-full bg-day px-4 py-2 text-sm font-semibold text-ink',
          FOCUS_RING_CLASS,
        )}
        onChange={(event) => onChange(Number(event.target.value))}
        value={value}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
