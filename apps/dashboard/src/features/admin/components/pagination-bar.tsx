import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatNumber } from '@/lib/utils';

/** Compact page-number list with ellipses, e.g. 1 … 4 [5] 6 … 12. */
function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(total - 1, page + 1);
  if (from > 2) out.push('…');
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total - 1) out.push('…');
  out.push(total);
  return out;
}

export function PaginationBar({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalItems,
  onPage,
  unit = 'mục',
}: {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  onPage: (page: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
      <p className="font-label text-xs tracking-wide text-muted-foreground">
        {formatNumber(rangeStart)}–{formatNumber(rangeEnd)} / {formatNumber(totalItems)} {unit}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft />
        </Button>
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={cn(
                'font-label grid size-8 place-items-center rounded-md text-sm transition-all',
                p === page
                  ? 'glow-ring bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {p}
            </button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
