import type { ReactElement, ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { FOCUS_RING_CLASS } from './focus-ring';

interface StickyCtaProps {
  readonly to: LinkProps['to'];
  readonly children: ReactNode;
}

export function StickyCta({ to, children }: StickyCtaProps): ReactElement {
  return (
    <Link
      to={to}
      className={cn(
        'fixed right-7 bottom-6 z-40 hidden items-center rounded-full bg-gold px-6 py-4 text-sm font-bold text-ink no-underline shadow-lg md:inline-flex',
        FOCUS_RING_CLASS,
      )}
    >
      {children}
    </Link>
  );
}
