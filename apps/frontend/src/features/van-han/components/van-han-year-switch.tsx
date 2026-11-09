import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { vanHanYearZodiacPath } from '@/features/van-han/van-han-paths';

const SWITCH_LABEL = 'Năm khác';
const MIN_YEARS_TO_SWITCH = 2;

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
    <nav aria-label={SWITCH_LABEL} className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      <span className="text-muted-foreground">{SWITCH_LABEL}:</span>
      {publishedYears.map((year) =>
        year === shownYear ? (
          <span key={year} aria-current="true" className="font-bold text-[#a8332a]">
            {year}
          </span>
        ) : (
          <Link
            key={year}
            className="font-medium text-foreground underline underline-offset-4"
            to={vanHanYearZodiacPath(year, chi)}
          >
            {year}
          </Link>
        ),
      )}
    </nav>
  );
}
