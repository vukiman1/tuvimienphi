import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { EntryKind } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';
import { entryPath } from '../kien-thuc-paths';

interface EntryTileProps {
  readonly kind: EntryKind;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
}

export function EntryTile({ kind, slug, title, summary }: EntryTileProps): ReactElement {
  return (
    <Link
      to={entryPath(kind, slug)}
      className={cn(
        'flex flex-col gap-1 rounded-xl border border-ink/15 bg-day p-4 no-underline hover:inset-ring-2 hover:inset-ring-ink',
        FOCUS_RING_CLASS,
      )}
    >
      <span className="font-bold text-ink">{title}</span>
      <span className="text-sm text-ink-soft">{summary}</span>
    </Link>
  );
}
