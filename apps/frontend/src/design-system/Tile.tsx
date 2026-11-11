import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface TileProps {
  readonly title: string;
  readonly caption?: string;
  readonly isActive?: boolean;
}

export function Tile({ title, caption, isActive = false }: TileProps): ReactElement {
  return (
    <div
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'flex flex-col gap-1 rounded-lg border px-4 py-3',
        isActive ? 'border-gold bg-gold text-ink' : 'border-current',
      )}
    >
      <span className="font-display text-lg font-bold">{title}</span>
      {caption === undefined ? null : <span className="text-sm">{caption}</span>}
    </div>
  );
}
