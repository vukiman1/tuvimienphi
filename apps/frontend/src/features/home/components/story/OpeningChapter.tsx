import type { ReactElement } from 'react';
import { ChevronsDown } from 'lucide-react';
import {
  ChapterTone,
  CtaButton,
  CtaTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  StoryChapter,
  TextLink,
} from '@/design-system';
import { MEDIA } from '@/config/media';
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
      <img
        alt=""
        decoding="async"
        fetchPriority="low"
        sizes="100vw"
        src={MEDIA.story.nightSkyLarge}
        srcSet={`${MEDIA.story.nightSkySmall} 768w, ${MEDIA.story.nightSkyLarge} 1536w`}
        className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-[55%_center] md:object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/4 bg-linear-to-b from-transparent to-deep"
      />
      <div className="absolute top-28 right-6 z-10 md:top-24 md:right-16">
        <TextLink to="/" hash={BIRTH_FORM_ANCHOR}>
          {OPENING.skipLabel} <span aria-hidden="true">→</span>
        </TextLink>
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pt-40 pb-44 md:px-12 md:pt-32 md:pb-32">
        <Eyebrow>{OPENING.eyebrow}</Eyebrow>
        <DisplayTitle as="h1" size={DisplaySize.Hero}>
          <span className="whitespace-nowrap">{OPENING.title}</span>{' '}
          <Emphasis isAccent>{OPENING.emphasis}</Emphasis>
        </DisplayTitle>
        <p className="max-w-xl text-lg leading-relaxed">{OPENING.subtitle}</p>
        <div className="mt-3">
          <CtaButton tone={CtaTone.Gold} to="/" hash={BIRTH_FORM_ANCHOR}>
            {OPENING.ctaLabel} <span aria-hidden="true">→</span>
          </CtaButton>
        </div>
      </div>
      <p className="absolute bottom-32 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-[0.14em] whitespace-nowrap uppercase md:bottom-8">
        <ChevronsDown aria-hidden="true" className="size-4 motion-safe:animate-bounce" />
        {OPENING.scrollHint}
      </p>
    </StoryChapter>
  );
}
