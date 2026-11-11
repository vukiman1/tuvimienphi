import type { ReactElement, ReactNode } from 'react';

export function ReadingZone({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <div className="mx-auto max-w-reading bg-day text-reading leading-reading text-ink">
      {children}
    </div>
  );
}
