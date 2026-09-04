import { Link } from '@tanstack/react-router';
import { Clock, Trash2 } from 'lucide-react';
import type { LaSoHistoryEntry } from '@org/shared-contracts';
import { MEDIA } from '@/config/media';
import { CALENDAR_LABELS, GENDER_LABELS } from '@/features/la-so/birth-input';
import { toChartSearch } from '../to-chart-search';

const UNNAMED = 'Chưa đặt tên';

/** Ngày sinh luôn hai chữ số để các thẻ xếp thẳng cột với nhau. */
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
  entry: LaSoHistoryEntry;
  onRemove: (birthKey: string) => void;
}

export function HistoryCard({ entry, onRemove }: HistoryCardProps) {
  const name = entry.fullName || UNNAMED;

  return (
    <li className="relative">
      <Link
        className="flex items-center gap-4 rounded-2xl border border-[#c9a15c]/55 bg-[#fdfaf3]/90 p-4 pr-12 sm:gap-5 sm:p-5 sm:pr-14 shadow-[0_2px_12px_rgba(124,86,40,0.08)] transition-colors hover:border-[#c9a15c] focus-visible:border-[#c9a15c] focus-visible:ring-2 focus-visible:ring-[#c9a15c]/40 focus-visible:outline-none"
        search={toChartSearch(entry)}
        to="/la-so/detail"
      >
        <img
          alt=""
          aria-hidden
          className="size-16 shrink-0 object-contain sm:size-20"
          src={MEDIA.laSo.historyBagua}
        />

        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-bold text-[#2f2117]">{name}</p>

          <p className="mt-1 text-sm text-[#6b5b48]">
            {formatBirthDate(entry)}
            <span className="mx-1.5 text-[#c9a15c] sm:mx-2">│</span>
            {CALENDAR_LABELS[entry.calendar]} lịch
          </p>
          <p className="text-sm text-[#6b5b48]">
            Giờ {entry.hour}
            <span className="mx-1.5 text-[#c9a15c] sm:mx-2">│</span>
            {GENDER_LABELS[entry.gender]}
          </p>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-[#8a7256]">
            <Clock className="size-3.5" />
            Xem lúc {formatViewedAt(entry.viewedAt)}
          </p>
        </div>
      </Link>

      <button
        aria-label={`Xoá lá số ${name} khỏi lịch sử`}
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-[#c9a15c]/40 bg-white text-[#a3271b] shadow-sm transition-colors hover:bg-[#fdeceb] focus-visible:ring-2 focus-visible:ring-[#c9a15c] focus-visible:outline-none"
        onClick={() => onRemove(entry.birthKey)}
        type="button"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
