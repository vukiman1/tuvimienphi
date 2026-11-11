import type { ReactElement, ReactNode } from 'react';

export function Chip({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <span className="inline-flex h-fit items-center rounded-full border border-current px-4 py-2 text-xs font-semibold">
      {children}
    </span>
  );
}
