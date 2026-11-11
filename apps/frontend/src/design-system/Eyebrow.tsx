import type { ReactElement, ReactNode } from 'react';

export function Eyebrow({ children }: { readonly children: ReactNode }): ReactElement {
  return <p className="text-xs leading-[1.8] font-bold tracking-[0.17em] uppercase">{children}</p>;
}
