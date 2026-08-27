import { MoonStar } from 'lucide-react';
import type { ReactNode } from 'react';

/** A themed empty state — a faint moon-star sigil over a message. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-8 text-center">
      <span className="glow-ring grid size-11 place-items-center rounded-full bg-primary/8 text-primary/80">
        <MoonStar className="size-5" />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      {children && <p className="mt-1 text-xs text-muted-foreground">{children}</p>}
    </div>
  );
}
