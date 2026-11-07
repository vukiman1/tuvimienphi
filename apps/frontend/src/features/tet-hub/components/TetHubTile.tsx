import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface TetHubTileProps {
  readonly to: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly children?: ReactNode;
}

export function TetHubTile({ to, title, subtitle, children }: TetHubTileProps): ReactElement {
  return (
    <Link
      to={to}
      className="flex h-full flex-col gap-2 rounded-xl border border-[#e0cfa5] bg-[#faf5ea] px-4 py-4 no-underline transition-colors hover:border-[#c9a15c] focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none"
    >
      <span className="text-[17px] font-semibold text-[#2a1f0e]">{title}</span>
      {subtitle ? <span className="text-[13px] text-[#8d7a5c]">{subtitle}</span> : null}
      {children ? <span className="mt-auto flex flex-wrap gap-2">{children}</span> : null}
    </Link>
  );
}
