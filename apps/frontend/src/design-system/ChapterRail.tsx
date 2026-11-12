import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { isDarkTone } from './chapter-tone';
import { FOCUS_RING_CLASS } from './focus-ring';
import { VIEWPORT_CENTRE, useChapterAt, useStoryChapters } from './StoryProvider';

const DOT_CELL_CLASS =
  'relative grid size-5 shrink-0 place-items-center after:absolute after:top-full after:left-1/2 after:h-3 after:w-px after:-translate-x-1/2 after:bg-current after:opacity-30 group-last:after:hidden';
const DOT_CLASS =
  'block size-1.5 rounded-full border border-current transition-all motion-reduce:transition-none group-hover:size-3 group-aria-[current=location]:size-3';
const DOT_ACTIVE_ON_DARK_CLASS =
  'group-hover:border-gold group-hover:bg-gold group-aria-[current=location]:border-gold group-aria-[current=location]:bg-gold';
const DOT_ACTIVE_ON_LIGHT_CLASS = 'group-hover:bg-current group-aria-[current=location]:bg-current';
const TEXT_CLASS =
  'flex max-w-28 items-start gap-1 rounded-2xl px-2 py-0.5 text-right text-2xs font-semibold backdrop-blur-sm';
const NAME_HIDDEN_CLASS = 'hidden group-hover:inline group-focus-visible:inline';

export function ChapterRail(): ReactElement | null {
  const chapters = useStoryChapters();
  const active = useChapterAt(VIEWPORT_CENTRE);
  if (chapters.length === 0) {
    return null;
  }
  const isOverDark = active !== null && isDarkTone(active.tone);

  return (
    <nav
      aria-label="Các chương"
      className={cn(
        'fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 justify-items-end gap-3 min-[900px]:grid',
        isOverDark ? 'text-day' : 'text-ink',
      )}
    >
      {chapters.map((chapter, index) => {
        const isCurrent = chapter.id === active?.id;
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            aria-label={chapter.label}
            aria-current={isCurrent ? 'location' : undefined}
            className={cn('group flex items-center gap-1.5', FOCUS_RING_CLASS)}
          >
            <span
              aria-hidden="true"
              className={cn(TEXT_CLASS, isOverDark ? 'bg-night/60' : 'bg-day/60')}
            >
              <span>{index + 1}.</span>
              <span className={isCurrent ? undefined : NAME_HIDDEN_CLASS}>{chapter.label}</span>
            </span>
            <span aria-hidden="true" className={DOT_CELL_CLASS}>
              <span
                data-rail-dot
                className={cn(
                  DOT_CLASS,
                  isOverDark ? DOT_ACTIVE_ON_DARK_CLASS : DOT_ACTIVE_ON_LIGHT_CLASS,
                )}
              />
            </span>
          </a>
        );
      })}
    </nav>
  );
}
