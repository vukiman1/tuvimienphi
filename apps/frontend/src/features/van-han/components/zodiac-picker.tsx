import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { vanHanYearZodiacPath, vanHanZodiacPath } from '@/features/van-han/van-han-paths';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { cn } from '@/lib/utils';
import {
  PICKED_ZODIAC_TILE_CLASS,
  ZODIAC_GRID_CLASS,
  ZODIAC_ROW_LABEL,
  ZODIAC_TILE_CLASS,
  ZodiacTileFace,
} from './zodiac-row';

interface ZodiacPickerProps {
  readonly year?: number;
}

function zodiacPath(chi: ZodiacChi, year: number | undefined): string {
  return year === undefined ? vanHanZodiacPath(chi) : vanHanYearZodiacPath(year, chi);
}

export function ZodiacPicker({ year }: ZodiacPickerProps): ReactElement {
  return (
    <nav aria-label={ZODIAC_ROW_LABEL}>
      <ul className={ZODIAC_GRID_CLASS}>
        {ZODIAC_CHI.map((entry, chiIndex) => (
          <li key={entry.chi}>
            <Link
              activeProps={{ className: PICKED_ZODIAC_TILE_CLASS }}
              className={cn(ZODIAC_TILE_CLASS, FOCUS_RING_CLASS)}
              to={zodiacPath(entry.chi, year)}
            >
              <ZodiacTileFace chi={entry.chi} chiIndex={chiIndex} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
