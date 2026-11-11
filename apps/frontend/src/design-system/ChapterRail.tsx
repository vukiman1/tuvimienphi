import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { isDarkTone } from './chapter-tone';
import { FOCUS_RING_CLASS } from './focus-ring';
import { VIEWPORT_CENTRE, useChapterAt, useStoryChapters } from './StoryProvider';

const DOT_CLASS =
  'block size-1.5 rounded-full border border-current transition-all motion-reduce:transition-none group-hover:size-3 group-aria-[current=location]:size-3';
const DOT_ACTIVE_ON_DARK_CLASS =
  'group-hover:border-gold group-hover:bg-gold group-aria-[current=location]:border-gold group-aria-[current=location]:bg-gold';
const DOT_ACTIVE_ON_LIGHT_CLASS = 'group-hover:bg-current group-aria-[current=location]:bg-current';
const LABEL_CLASS =
  'pointer-events-none absolute right-7 rounded bg-ink px-3 py-2 text-xs whitespace-nowrap text-day opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100';

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
        'fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 gap-3 min-[900px]:grid',
        isOverDark ? 'text-day' : 'text-ink',
      )}
    >
      {chapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          aria-label={chapter.label}
          aria-current={chapter.id === active?.id ? 'location' : undefined}
          className={cn('group relative grid size-5 place-items-center', FOCUS_RING_CLASS)}
        >
          <span
            aria-hidden="true"
            className={cn(
              DOT_CLASS,
              isOverDark ? DOT_ACTIVE_ON_DARK_CLASS : DOT_ACTIVE_ON_LIGHT_CLASS,
            )}
          />
          <span aria-hidden="true" className={LABEL_CLASS}>
            {chapter.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
