import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';

const EMBLEM_SIZE = 56;

export enum TileSurface {
  Night = 'night',
  Day = 'day',
}

const TILE_SURFACE_CLASS: Readonly<Record<TileSurface, string>> = {
  [TileSurface.Night]: 'border-day/20 bg-night text-day',
  [TileSurface.Day]: 'border-ink/15 bg-day text-ink',
};

const SUBTITLE_SURFACE_CLASS: Readonly<Record<TileSurface, string>> = {
  [TileSurface.Night]: 'text-day-soft',
  [TileSurface.Day]: 'text-ink-soft',
};

interface TetHubTileProps {
  readonly to: string;
  readonly title: string;
  readonly surface: TileSurface;
  readonly subtitle?: string;
  readonly emblem?: string;
  readonly children?: ReactNode;
}

export function TetHubTile({
  to,
  title,
  surface,
  subtitle,
  emblem,
  children,
}: TetHubTileProps): ReactElement {
  return (
    <Link
      to={to}
      className={cn(
        'flex h-full flex-col gap-2 rounded-2xl border px-4 py-4 no-underline transition-colors hover:border-gold',
        TILE_SURFACE_CLASS[surface],
        FOCUS_RING_CLASS,
      )}
    >
      {emblem === undefined ? null : (
        <img
          alt=""
          src={emblem}
          width={EMBLEM_SIZE}
          height={EMBLEM_SIZE}
          loading="lazy"
          decoding="async"
          className="size-14 rounded-full"
        />
      )}
      <span className="font-display text-lg font-extrabold">{title}</span>
      {subtitle === undefined ? null : (
        <span className={cn('text-sm', SUBTITLE_SURFACE_CLASS[surface])}>{subtitle}</span>
      )}
      {children === undefined ? null : (
        <span className="mt-auto flex flex-wrap gap-2">{children}</span>
      )}
    </Link>
  );
}
