import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  seal,
  hanReading,
  actions,
}: {
  title: string;
  subtitle?: string;
  /** A single Hán character shown on the cinnabar seal (e.g. 運 for Vận hạn). */
  seal: string;
  /** The Sino-Vietnamese reading shown as a brush kicker (e.g. "Vận Hạn"). */
  hanReading?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="relative mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Oversized Hán watermark — a faint misty character behind the heading. Hidden when the header
          carries an action button (top-right), so the two never overlap. */}
      {!actions && (
        <span
          aria-hidden="true"
          className="font-seal pointer-events-none absolute -top-8 right-0 hidden select-none text-[8rem] leading-none text-foreground/[0.07] sm:block"
        >
          {seal}
        </span>
      )}

      <div className="flex items-center gap-4">
        {/* Ấn triện */}
        <div className="seal-stamp size-14 shrink-0 text-2xl leading-none sm:size-16 sm:text-3xl">
          {seal}
        </div>

        <div>
          {hanReading && (
            <p className="font-seal text-sm leading-none text-primary/80">{hanReading}</p>
          )}
          <h1 className="mt-1 font-display text-[1.7rem] leading-tight font-semibold text-foreground">
            {title}
          </h1>
          {/* Ornamental divider between title and caption. */}
          <div className="mt-2 flex items-center gap-2">
            <span className="size-1.5 rotate-45 bg-primary/70 shadow-[0_0_6px_var(--primary)]" />
            <span className="rule-ornament w-24" />
          </div>
          {subtitle && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
