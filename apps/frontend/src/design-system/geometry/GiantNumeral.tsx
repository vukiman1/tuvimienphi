import type { CSSProperties, ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface GiantNumeralProps {
  readonly parts: readonly string[];
  readonly label: string;
  readonly partStyles?: readonly CSSProperties[];
  readonly className?: string;
}

export function GiantNumeral({
  parts,
  label,
  partStyles,
  className,
}: GiantNumeralProps): ReactElement {
  return (
    <p
      role="img"
      aria-label={label}
      className={cn(
        'font-display leading-[1.15] font-light tracking-display whitespace-nowrap',
        className,
      )}
    >
      {parts.map((part, index) => (
        <span key={`${index}:${part}`} className="inline-block" style={partStyles?.[index]}>
          {index === 0 ? part : ` ${part}`}
        </span>
      ))}
    </p>
  );
}
