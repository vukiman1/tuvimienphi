import type { ReactElement } from 'react';
import {
  ChapterTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  StoryChapter,
  TextLink,
} from '@/design-system';
import { CHAPTER_LABELS, TRUTHS } from '@/features/home/home-content';
import { cn } from '@/lib/utils';

interface CardStyle {
  readonly surface: string;
  readonly stickyOffset: string;
}

type OnePerPoint<Points extends readonly unknown[], Value> = {
  readonly [Index in keyof Points]: Value;
};

const CARD_STYLES = [
  { surface: 'bg-dawn', stickyOffset: 'md:top-24' },
  { surface: 'bg-day', stickyOffset: 'md:top-28' },
  { surface: 'bg-gold', stickyOffset: 'md:top-32' },
] as const satisfies OnePerPoint<typeof TRUTHS.points, CardStyle>;

export function TruthsChapter(): ReactElement {
  return (
    <StoryChapter id="ba-goc-nhin" tone={ChapterTone.Dawn} label={CHAPTER_LABELS.truths}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-24 md:px-12 md:py-32">
        <div className="mb-6 flex flex-col gap-4">
          <Eyebrow>{TRUTHS.eyebrow}</Eyebrow>
          <DisplayTitle size={DisplaySize.Chapter}>
            {TRUTHS.title} <Emphasis>{TRUTHS.emphasis}</Emphasis>
          </DisplayTitle>
        </div>
        {TRUTHS.points.map((point, index) => (
          <article
            key={point.title}
            className={cn(
              'grid gap-4 border border-ink p-7 md:sticky md:grid-cols-[12rem_1fr] md:items-center md:gap-10 md:p-16',
              CARD_STYLES[index].surface,
              CARD_STYLES[index].stickyOffset,
            )}
          >
            <span
              aria-hidden="true"
              className="font-display text-8xl leading-none font-light tracking-display md:text-[10rem]"
            >
              {index + 1}
            </span>
            <div className="flex flex-col gap-3">
              <DisplayTitle as="h3" size={DisplaySize.Card}>
                {point.title}
              </DisplayTitle>
              <p className="max-w-2xl text-reading leading-reading">{point.description}</p>
              <div>
                <TextLink to="/kien-thuc">
                  {point.linkLabel} <span aria-hidden="true">↗</span>
                </TextLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    </StoryChapter>
  );
}
