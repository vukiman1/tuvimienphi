import type { ReactElement, ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { FOCUS_RING_CLASS } from './focus-ring';

interface TextLinkProps {
  readonly to: LinkProps['to'];
  readonly children: ReactNode;
}

export function TextLink({ to, children }: TextLinkProps): ReactElement {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex min-h-11 items-center border-b border-current text-sm font-bold no-underline',
        FOCUS_RING_CLASS,
      )}
    >
      {children}
    </Link>
  );
}
