import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface GiantNumeralProps {
  readonly value: string;
  readonly label: string;
  readonly className?: string;
}

export function GiantNumeral({ value, label, className }: GiantNumeralProps): ReactElement {
  return (
    <p
      role="img"
      aria-label={label}
      className={cn(
        'font-display leading-[1.15] font-light tracking-display whitespace-nowrap',
        className,
      )}
    >
      {value}
    </p>
  );
}
