import type { ReactElement } from 'react';
import {
  ChapterTone,
  CtaButton,
  CtaTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  Orbit,
  StoryChapter,
  TextLink,
} from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { CHAPTER_LABELS, OPENING } from '@/features/home/home-content';

export function OpeningChapter(): ReactElement {
  return (
    <StoryChapter
      id="mo-dau"
      tone={ChapterTone.Night}
      label={CHAPTER_LABELS.opening}
      className="flex min-h-svh items-center overflow-hidden"
    >
      <Orbit
        rings={3}
        className="pointer-events-none absolute top-[10%] -right-1/2 w-[95vw] text-gold opacity-40 md:-right-[10%] md:w-[min(70vw,62rem)]"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pt-32 pb-28 md:px-12">
        <Eyebrow>{OPENING.eyebrow}</Eyebrow>
        <DisplayTitle as="h1" size={DisplaySize.Hero}>
          {OPENING.title} <Emphasis>{OPENING.emphasis}</Emphasis>
        </DisplayTitle>
        <p className="max-w-xl text-lg leading-relaxed">{OPENING.subtitle}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4">
          <CtaButton tone={CtaTone.Gold} to="/" hash={BIRTH_FORM_ANCHOR}>
            {OPENING.ctaLabel} <span aria-hidden="true">↗</span>
          </CtaButton>
          <TextLink to="/" hash={BIRTH_FORM_ANCHOR}>
            {OPENING.skipLabel} <span aria-hidden="true">→</span>
          </TextLink>
        </div>
      </div>
      <p className="absolute bottom-24 left-6 text-xs tracking-[0.14em] uppercase md:bottom-8 md:left-12">
        {OPENING.scrollHint}
      </p>
    </StoryChapter>
  );
}
