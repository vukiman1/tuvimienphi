import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { conGiapEmblem } from '@/features/tet-hub/tet-hub-paintings';
import { vanHanYearZodiacPath, vanHanZodiacPath } from '@/features/van-han/van-han-paths';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { cn } from '@/lib/utils';

const PICKER_LABEL = 'Chọn con giáp';
const EMBLEM_SIZE = 48;
const TILE_CLASS =
  'flex min-h-11 flex-col items-center gap-2 rounded-xl px-1 py-3 text-sm font-semibold text-ink no-underline hover:bg-day-200';
const PICKED_TILE_CLASS = 'bg-gold/10 inset-ring-2 inset-ring-ink';

interface ZodiacPickerProps {
  readonly year?: number;
}

function zodiacPath(chi: ZodiacChi, year: number | undefined): string {
  return year === undefined ? vanHanZodiacPath(chi) : vanHanYearZodiacPath(year, chi);
}

export function ZodiacPicker({ year }: ZodiacPickerProps): ReactElement {
  return (
    <nav aria-label={PICKER_LABEL}>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {ZODIAC_CHI.map((entry, chiIndex) => (
          <li key={entry.chi}>
            <Link
              activeProps={{ className: PICKED_TILE_CLASS }}
              className={cn(TILE_CLASS, FOCUS_RING_CLASS)}
              to={zodiacPath(entry.chi, year)}
            >
              <img
                alt=""
                className="size-12 rounded-full"
                decoding="async"
                height={EMBLEM_SIZE}
                loading="lazy"
                src={conGiapEmblem(chiIndex)}
                width={EMBLEM_SIZE}
              />
              {entry.chi}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
