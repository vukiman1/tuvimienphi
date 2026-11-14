import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { BoardDensity } from '@/features/la-so/board-density';
import { cn } from '@/lib/utils';

interface BoardDensityToggleProps {
  readonly value: BoardDensity;
  readonly onChange: (density: BoardDensity) => void;
}

const DENSITY_OPTIONS = [
  { density: BoardDensity.Key, label: 'Gọn' },
  { density: BoardDensity.All, label: 'Đủ sao' },
] as const;

export function BoardDensityToggle({ value, onChange }: BoardDensityToggleProps): ReactElement {
  return (
    <div
      aria-label="Mật độ lá số"
      className="inline-flex rounded-full border border-gold/55 p-0.5"
      role="group"
    >
      {DENSITY_OPTIONS.map(({ density, label }) => {
        const isChosen = value === density;
        return (
          <button
            key={density}
            aria-pressed={isChosen}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors motion-reduce:transition-none',
              FOCUS_RING_CLASS,
              isChosen ? 'bg-gold text-night' : 'text-day-soft hover:text-day',
            )}
            onClick={() => onChange(density)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
