import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { LuanGiaiChapterStatus } from '@org/shared-contracts';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';

interface LuanGiaiChaptersProps {
  readonly chapters: readonly LuanGiaiChapter[];
  readonly activeOrder: string;
  readonly statuses?: Readonly<Record<string, LuanGiaiChapterStatus>>;
  readonly onSelect: (order: string) => void;
}

const SCROLL_RATIO = 0.85;

const SCROLL_EPSILON = 4;

const ARROW_CLASS = cn(
  'absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-day/20 bg-night text-day transition',
  FOCUS_RING_CLASS,
);

export function LuanGiaiChapters({
  chapters,
  activeOrder,
  statuses,
  onSelect,
}: LuanGiaiChaptersProps): ReactElement {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const update = () => {
      setCanScrollLeft(track.scrollLeft > SCROLL_EPSILON);
      setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - SCROLL_EPSILON);
    };
    const observer = new ResizeObserver(update);
    observer.observe(track);
    track.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', update);
    };
  }, [chapters.length]);

  const scrollByPage = (direction: -1 | 1): void => {
    const track = trackRef.current;
    if (track) {
      track.scrollBy({ left: direction * track.clientWidth * SCROLL_RATIO, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <div
        aria-label="Các mục luận giải"
        className="flex snap-x snap-proximity items-stretch gap-1 scroll-px-2 overflow-x-auto scroll-smooth rounded-2xl border border-day/20 bg-night/40 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={trackRef}
        role="tablist"
      >
        {chapters.map((chapter) => {
          const trangThai = statuses?.[chapter.order];
          const chuaMo = trangThai === LuanGiaiChapterStatus.Pending;
          const chuaSoan = trangThai === LuanGiaiChapterStatus.Unavailable;

          return (
            <button
              key={chapter.order}
              aria-selected={chapter.order === activeOrder}
              className={cn(
                'flex min-w-44 flex-1 snap-start flex-col rounded-xl px-3 py-2 text-left transition-colors',
                FOCUS_RING_CLASS,
                chapter.order === activeOrder ? 'bg-gold text-ink' : 'text-day hover:bg-night/60',
                chuaSoan && chapter.order !== activeOrder && 'opacity-55',
              )}
              onClick={() => onSelect(chapter.order)}
              role="tab"
              type="button"
            >
              <span className="flex items-center gap-1.5 font-display text-xs font-extrabold tracking-widest">
                {chapter.order}
                {chuaMo ? <Lock aria-label="Chưa mở" className="size-3" /> : null}
              </span>
              <span className="block text-sm font-semibold">{chapter.title}</span>
            </button>
          );
        })}
      </div>

      <button
        aria-label="Các mục trước"
        className={cn(ARROW_CLASS, 'left-1', !canScrollLeft && 'pointer-events-none opacity-0')}
        onClick={() => scrollByPage(-1)}
        type="button"
      >
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <button
        aria-label="Các mục sau"
        className={cn(ARROW_CLASS, 'right-1', !canScrollRight && 'pointer-events-none opacity-0')}
        onClick={() => scrollByPage(1)}
        type="button"
      >
        <ChevronRight aria-hidden className="size-5" />
      </button>
    </div>
  );
}
