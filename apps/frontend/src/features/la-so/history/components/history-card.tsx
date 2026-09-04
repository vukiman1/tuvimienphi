import { Link } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@org/frontend-shared';
import type { LaSoHistoryEntry } from '@org/shared-contracts';
import { Button } from '@/components/ui/button';
import { CALENDAR_LABELS, GENDER_LABELS } from '@/features/la-so/birth-input';
import { toChartSearch } from '../to-chart-search';

const UNNAMED = 'Chưa đặt tên';

interface HistoryCardProps {
  entry: LaSoHistoryEntry;
  onRemove: (birthKey: string) => void;
}

export function HistoryCard({ entry, onRemove }: HistoryCardProps) {
  const born = `${entry.day}/${entry.month}/${entry.year} ${CALENDAR_LABELS[entry.calendar]} lịch`;

  return (
    <li className="relative">
      <Link
        className="block rounded-xl border border-[#c9a15c]/40 bg-card/60 p-4 pr-12 transition-colors hover:border-[#c9a15c] focus-visible:border-[#c9a15c]"
        params={{}}
        search={toChartSearch(entry)}
        to="/la-so/detail"
      >
        <p className="truncate font-display text-lg font-semibold text-foreground">
          {entry.fullName || UNNAMED}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {born} · giờ {entry.hour} · {GENDER_LABELS[entry.gender]}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Xem lúc {formatDate(entry.viewedAt)}</p>
      </Link>

      <Button
        aria-label={`Xoá lá số ${entry.fullName || UNNAMED} khỏi lịch sử`}
        className="absolute top-3 right-3"
        onClick={() => onRemove(entry.birthKey)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
