import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Clock, Trash2 } from 'lucide-react';
import type { LaSoHistoryEntry } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { CALENDAR_LABELS, GENDER_LABELS } from '@/features/la-so/birth-input';
import { cn } from '@/lib/utils';
import { toChartSearch } from '../to-chart-search';

const UNNAMED = 'Chưa đặt tên';

function formatBirthDate({ day, month, year }: LaSoHistoryEntry): string {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function formatViewedAt(viewedAt: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(viewedAt));
}

interface HistoryCardProps {
  readonly entry: LaSoHistoryEntry;
  readonly onRemove: (birthKey: string) => void;
}

export function HistoryCard({ entry, onRemove }: HistoryCardProps): ReactElement {
  const name = entry.fullName || UNNAMED;

  return (
    <li className="relative">
      <Link
        className={cn(
          'block rounded-2xl border border-ink/15 bg-day p-5 pr-14 transition-colors hover:border-gold',
          FOCUS_RING_CLASS,
        )}
        search={toChartSearch(entry)}
        to="/la-so/detail"
      >
        <p className="truncate text-2xl font-bold text-ink">{name}</p>

        <p className="mt-1 text-sm text-ink-soft">
          {formatBirthDate(entry)}
          <span className="mx-1.5 text-ink/30 sm:mx-2">│</span>
          {CALENDAR_LABELS[entry.calendar]} lịch
        </p>
        <p className="text-sm text-ink-soft">
          Giờ {entry.hour}
          <span className="mx-1.5 text-ink/30 sm:mx-2">│</span>
          {GENDER_LABELS[entry.gender]}
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
          <Clock aria-hidden className="size-3.5" />
          Xem lúc {formatViewedAt(entry.viewedAt)}
        </p>
      </Link>

      <button
        aria-label={`Xoá lá số ${name} khỏi lịch sử`}
        className={cn(
          'absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-ink/15 bg-day text-danger transition-colors hover:bg-day-200',
          FOCUS_RING_CLASS,
        )}
        onClick={() => onRemove(entry.birthKey)}
        type="button"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
    </li>
  );
}
