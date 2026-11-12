import { type ReactElement, useRef } from 'react';
import {
  ChapterTone,
  CtaButton,
  CtaTone,
  DisplaySize,
  DisplayTitle,
  Eyebrow,
  StoryChapter,
  useSectionProgress,
} from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { CHAPTER_LABELS, MAP } from '@/features/home/home-content';
import { cn } from '@/lib/utils';
import type { CungName } from '@org/shared-tu-vi';
import { BOARD_CELLS, activeStatementIndex } from './story-board';

export function MapChapter(): ReactElement {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { progress, isLive } = useSectionProgress(sceneRef);
  const activeIndex = isLive ? activeStatementIndex(progress, MAP.statements.length) : null;
  const highlighted: readonly CungName[] =
    activeIndex === null ? [] : MAP.statements[activeIndex].highlights;

  return (
    <StoryChapter
      id="la-so"
      tone={ChapterTone.Dusk}
      label={CHAPTER_LABELS.map}
      className="pinned:h-[315vh]"
    >
      <div ref={sceneRef} className="h-full">
        <div className="py-24 pinned:sticky pinned:top-0 pinned:flex pinned:h-svh pinned:items-center pinned:overflow-hidden pinned:pt-20 pinned:pb-8">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-center md:gap-16 md:px-12">
            <div className="flex flex-col gap-4">
              <Eyebrow>{MAP.eyebrow}</Eyebrow>
              <DisplayTitle size={DisplaySize.Chapter}>{MAP.title}</DisplayTitle>
              <p className="text-lg">{MAP.subtitle}</p>
              <div
                role="img"
                aria-label={MAP.boardLabel}
                className="mt-4 grid aspect-square w-full max-w-xl grid-cols-4 grid-rows-4 border border-day/60 pinned:max-w-[min(36rem,calc(100svh-26rem))]"
              >
                {BOARD_CELLS.map(({ name, row, column }) => (
                  <span
                    key={name}
                    style={{ gridRow: row, gridColumn: column }}
                    className={cn(
                      'border border-day/35 p-1.5 text-2xs font-semibold transition-colors motion-reduce:transition-none sm:text-sm md:p-3',
                      highlighted.includes(name) && 'bg-gold text-ink',
                    )}
                  >
                    {name}
                  </span>
                ))}
                <span
                  style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
                  className="flex items-center justify-center border border-day/50 text-center font-display text-xl font-light sm:text-3xl"
                >
                  {MAP.boardCentre}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <ol className="flex flex-col gap-4">
                {MAP.statements.map((statement, index) => (
                  <li
                    key={statement.title}
                    aria-current={index === activeIndex ? 'step' : undefined}
                    className={cn(
                      'border-l-2 pl-4 transition-colors motion-reduce:transition-none',
                      index === activeIndex ? 'border-gold text-day' : 'border-day/20',
                      activeIndex !== null && index !== activeIndex && 'text-day-soft',
                    )}
                  >
                    <h3 className="font-display text-xl font-bold tracking-display md:text-2xl">
                      {statement.title}
                    </h3>
                    <p className="mt-1">{statement.description}</p>
                  </li>
                ))}
              </ol>
              <div>
                <CtaButton tone={CtaTone.Outline} to="/" hash={BIRTH_FORM_ANCHOR}>
                  {MAP.ctaLabel} <span aria-hidden="true">↗</span>
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoryChapter>
  );
}
