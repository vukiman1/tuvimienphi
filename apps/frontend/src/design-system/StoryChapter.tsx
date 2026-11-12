import { type ReactElement, type ReactNode, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CHAPTER_TONE_CLASS, type ChapterTone } from './chapter-tone';
import { useStoryRegistration } from './StoryProvider';

interface StoryChapterProps {
  readonly id: string;
  readonly tone: ChapterTone;
  readonly label: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function StoryChapter({
  id,
  tone,
  label,
  children,
  className,
}: StoryChapterProps): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const register = useStoryRegistration();

  useLayoutEffect(() => {
    const element = ref.current;
    if (register === null || element === null) {
      return;
    }
    return register({ id, label, tone, element });
  }, [register, id, label, tone]);

  return (
    <section
      ref={ref}
      id={id}
      data-tone={tone}
      tabIndex={-1}
      className={cn('relative isolate focus:outline-none', CHAPTER_TONE_CLASS[tone], className)}
    >
      {children}
    </section>
  );
}
