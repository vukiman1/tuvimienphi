import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { cn } from '@/lib/utils';
import { vanHanYearZodiacPath } from '@/features/van-han/van-han-paths';

const SWITCH_LABEL = 'Năm khác';
const MIN_YEARS_TO_SWITCH = 2;
const YEAR_LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-full border border-day-soft px-4 text-sm font-semibold text-day no-underline hover:border-gold';
const SHOWN_YEAR_CLASS =
  'inline-flex min-h-11 items-center rounded-full bg-gold px-4 text-sm font-bold text-ink';

interface VanHanYearSwitchProps {
  readonly chi: ZodiacChi;
  readonly shownYear: number;
  readonly publishedYears: readonly number[];
}

export function VanHanYearSwitch({
  chi,
  shownYear,
  publishedYears,
}: VanHanYearSwitchProps): ReactElement | null {
  if (publishedYears.length < MIN_YEARS_TO_SWITCH) return null;
  return (
    <nav aria-label={SWITCH_LABEL} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-day-soft">{SWITCH_LABEL}:</span>
      {publishedYears.map((year) =>
        year === shownYear ? (
          <span key={year} aria-current="true" className={SHOWN_YEAR_CLASS}>
            {year}
          </span>
        ) : (
          <Link
            key={year}
            className={cn(YEAR_LINK_CLASS, FOCUS_RING_CLASS)}
            to={vanHanYearZodiacPath(year, chi)}
          >
            {year}
          </Link>
        ),
      )}
    </nav>
  );
}
