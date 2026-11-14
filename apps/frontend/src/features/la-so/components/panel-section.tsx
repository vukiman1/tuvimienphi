import type { ReactElement, ReactNode } from 'react';

interface PanelSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function PanelSection({ title, children }: PanelSectionProps): ReactElement {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-bold tracking-wide text-ink-soft uppercase">{title}</h3>
      {children}
    </section>
  );
}
