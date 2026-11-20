import type { ReactElement } from 'react';
import { conGiapEmblem } from '@/features/tet-hub/tet-hub-paintings';
import type { ZodiacChi } from '@/lib/zodiac-icons';

const EMBLEM_SIZE = 48;

export const ZODIAC_ROW_LABEL = 'Chọn con giáp';

export const ZODIAC_TILE_CLASS =
  'flex min-h-11 flex-col items-center gap-2 rounded-xl px-1 py-3 text-sm font-semibold text-ink no-underline hover:bg-day-200';
export const PICKED_ZODIAC_TILE_CLASS = 'bg-gold/10 inset-ring-2 inset-ring-ink';
export const ZODIAC_GRID_CLASS = 'grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12';

interface ZodiacTileFaceProps {
  readonly chi: ZodiacChi;
  readonly chiIndex: number;
}

export function ZodiacTileFace({ chi, chiIndex }: ZodiacTileFaceProps): ReactElement {
  return (
    <>
      <img
        alt=""
        className="size-12 rounded-full"
        decoding="async"
        height={EMBLEM_SIZE}
        loading="lazy"
        src={conGiapEmblem(chiIndex)}
        width={EMBLEM_SIZE}
      />
      {chi}
    </>
  );
}
