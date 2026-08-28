import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  readonly title: string;
  /** Leading ornament; defaults to a cinnabar-gold lozenge. */
  readonly icon?: ReactNode;
  /** Trailing gold rule that fills the remaining width. */
  readonly divider?: boolean;
  readonly className?: string;
}

/** A block heading: an ornament, an uppercase display title and an optional fading gold rule. */
export function SectionTitle({ title, icon, divider = true, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon ?? <span aria-hidden className="size-2 shrink-0 rotate-45 bg-[#c9a15c]" />}
      <h2 className="font-display text-[15px] font-semibold tracking-wide whitespace-nowrap text-[#2a1f0e] uppercase">
        {title}
      </h2>
      {divider && (
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-[#d9c39a] to-transparent" />
      )}
    </div>
  );
}
