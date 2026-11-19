import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';
import { sectionId } from '../active-section';
import { StateBar } from './state-bar';

const TOC_TITLE_ID = 'lesson-toc-title';

interface LessonTocProps {
  readonly headings: readonly string[];
  readonly activeIndex: number;
}

export function LessonToc({ headings, activeIndex }: LessonTocProps): ReactElement {
  return (
    <nav aria-labelledby={TOC_TITLE_ID} className="hidden lg:block">
      <div className="sticky top-6 flex flex-col gap-2">
        <p id={TOC_TITLE_ID} className="text-sm font-bold text-ink">
          Trong bài
        </p>
        <ol className="flex flex-col">
          {headings.map((heading, index) => {
            const isCurrent = index === activeIndex;
            return (
              <li key={sectionId(index)}>
                <a
                  href={`#${sectionId(index)}`}
                  aria-current={isCurrent ? 'location' : undefined}
                  className={cn(
                    'relative flex min-h-11 items-center py-2 pl-4 text-sm text-ink-soft no-underline hover:text-ink',
                    isCurrent && 'font-bold text-ink',
                    FOCUS_RING_CLASS,
                  )}
                >
                  {isCurrent && <StateBar />}
                  {heading}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
