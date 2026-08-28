import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One ornamental "回"-pattern (meander/key) corner with a small ring — a traditional Á Đông corner
 * motif. Drawn for the top-left; {@link PanelFrame} rotates it into the other three corners.
 */
function Corner({ className }: { readonly className?: string }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden
      className={cn('absolute text-[#c9a15c]', className)}
    >
      {/* Outer rounded bracket. */}
      <path d="M3 30V11a8 8 0 0 1 8-8h19" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
      {/* Inner parallel bracket, shorter. */}
      <path d="M8 24v-9a7 7 0 0 1 7-7h9" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Key ticks bridging the two brackets. */}
      <path d="M3 24h5M24 3v5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Ring detail nested in the corner. */}
      <circle cx="12.5" cy="12.5" r="1.9" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

/** The four ornamental gold corners that give panels their "sách cổ" feel. */
function PanelFrame() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-2">
      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0 rotate-90" />
      <Corner className="right-0 bottom-0 rotate-180" />
      <Corner className="bottom-0 left-0 -rotate-90" />
    </span>
  );
}

/** A sidebar surface: cream card, hairline gold border, soft shadow and an ornamental gold frame. */
export function Panel({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section
      className={cn(
        'relative rounded-2xl border border-[#e7d9bf] bg-card px-6 py-5 shadow-sm',
        className,
      )}
    >
      <PanelFrame />
      <div className="relative">{children}</div>
    </section>
  );
}

/** A panel's heading: a gold lozenge before an uppercase display title. */
export function PanelHeading({ children }: { readonly children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span aria-hidden className="size-2 shrink-0 rotate-45 bg-[#c9a15c]" />
      <h2 className="font-display text-[15px] font-semibold tracking-wide text-[#2a1f0e] uppercase">
        {children}
      </h2>
    </div>
  );
}
