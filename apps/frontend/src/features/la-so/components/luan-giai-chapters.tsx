import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { cn } from '@/lib/utils';
import { ImagePlaceholder } from '@/features/la-so/components/image-placeholder';

interface LuanGiaiChaptersProps {
  readonly chapters: readonly LuanGiaiChapter[];
  readonly activeOrder: string;
  readonly onSelect: (order: string) => void;
}

/** Mỗi lần bấm trượt gần trọn một khung, chừa lại một mẩu để mắt bắt được mạch. */
const SCROLL_RATIO = 0.85;

/** Vài pixel lẻ do bo tròn hoặc do điểm neo của scroll-snap thì không đáng hiện mũi tên. */
const SCROLL_EPSILON = 4;

const ARROW_CLASS =
  'absolute top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9a15c]/60 bg-[#4a1109] text-[#e2c186] shadow-md transition hover:bg-[#7a1f15] focus-visible:ring-2 focus-visible:ring-[#e2c186] focus-visible:outline-none';

/** Nền mờ dần dưới nút mũi tên, để mục bị che nửa chừng trông như đang trôi ra chứ không như lỗi. */
const EDGE_FADE_CLASS =
  'pointer-events-none absolute inset-y-[1px] z-10 w-16 transition-opacity duration-200';

export function LuanGiaiChapters({ chapters, activeOrder, onSelect }: LuanGiaiChaptersProps) {
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
    // Không gọi update() thẳng ở đây: ResizeObserver bắn callback ngay khi observe, nên trạng thái
    // ban đầu vẫn đúng mà không phải setState đồng bộ trong effect.
    const observer = new ResizeObserver(update);
    observer.observe(track);
    track.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', update);
    };
  }, [chapters.length]);

  const scrollByPage = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (track) {
      track.scrollBy({ left: direction * track.clientWidth * SCROLL_RATIO, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Ẩn thanh cuộn gốc nhưng vẫn cho vuốt: trên cảm ứng đó vẫn là cách tự nhiên nhất. */}
      <div
        aria-label="Các mục luận giải"
        className="flex snap-x snap-proximity items-stretch gap-1 scroll-px-2 overflow-x-auto scroll-smooth rounded-md border border-[#c9a15c]/45 bg-[#5e1710] px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={trackRef}
        role="tablist"
      >
        {chapters.map((chapter) => (
          <button
            key={chapter.order}
            aria-selected={chapter.order === activeOrder}
            className={cn(
              'flex min-w-[174px] flex-1 snap-start items-center gap-[10px] rounded px-[10px] py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#e2c186]',
              chapter.order === activeOrder ? 'bg-[#8f2a1d]' : 'hover:bg-[#7a1f15]',
            )}
            onClick={() => onSelect(chapter.order)}
            role="tab"
            type="button"
          >
            <ImagePlaceholder
              className="size-11 shrink-0"
              label="Icon"
              ratio="1 / 1"
              src={chapter.iconUrl}
            />
            <span className="min-w-0">
              <span className="block font-body text-[13px] leading-[17px] font-bold tracking-[0.08em] text-[#e2c186]">
                {chapter.order}
              </span>
              <span className="block font-body text-[15px] leading-[21px] font-medium text-[#f8efdb]">
                {chapter.title}
              </span>
            </span>
          </button>
        ))}
      </div>

      <span
        aria-hidden
        className={cn(
          EDGE_FADE_CLASS,
          'left-[1px] bg-gradient-to-r from-[#5e1710] to-transparent',
          !canScrollLeft && 'opacity-0',
        )}
      />
      <span
        aria-hidden
        className={cn(
          EDGE_FADE_CLASS,
          'right-[1px] bg-gradient-to-l from-[#5e1710] to-transparent',
          !canScrollRight && 'opacity-0',
        )}
      />

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
