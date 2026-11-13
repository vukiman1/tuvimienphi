import type { ReactElement, ReactNode } from 'react';
import { DisplaySize, DisplayTitle, Eyebrow, TitleFace } from '@/design-system';

interface LuanGiaiCardProps {
  readonly children: ReactNode;
}

export function LuanGiaiCard({ children }: LuanGiaiCardProps): ReactElement {
  return (
    <article className="rounded-3xl border border-ink/10 bg-day px-5 py-8 md:px-10">
      {children}
    </article>
  );
}

interface LuanGiaiCardHeaderProps {
  readonly order: string;
  readonly title: string;
  readonly eyebrow?: string;
}

export function LuanGiaiCardHeader({
  order,
  title,
  eyebrow,
}: LuanGiaiCardHeaderProps): ReactElement {
  return (
    <header className="flex items-center gap-4">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-night font-display text-2xl font-extrabold text-dawn shadow-glow-gold md:size-20 md:text-3xl">
        {order}
      </span>
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-ink-soft">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        )}
        <DisplayTitle as="h3" face={TitleFace.Serif} size={DisplaySize.Card}>
          {title}
        </DisplayTitle>
      </div>
    </header>
  );
}
