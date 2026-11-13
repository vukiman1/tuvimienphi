import type { ReactElement, ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { focusHashTarget } from './focus-hash-target';
import { FOCUS_RING_CLASS } from './focus-ring';

interface TextLinkProps {
  readonly to: LinkProps['to'];
  readonly params?: LinkProps['params'];
  readonly search?: LinkProps['search'];
  readonly hash?: string;
  readonly children: ReactNode;
}

export function TextLink({ to, params, search, hash, children }: TextLinkProps): ReactElement {
  return (
    <Link
      to={to}
      params={params}
      search={search}
      hash={hash}
      onClick={() => focusHashTarget(hash)}
      className={cn(
        'inline-flex min-h-11 items-center border-b border-current text-sm font-bold no-underline',
        FOCUS_RING_CLASS,
      )}
    >
      {children}
    </Link>
  );
}
