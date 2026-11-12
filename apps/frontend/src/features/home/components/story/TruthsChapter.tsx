import type { ReactElement } from 'react';
import {
  ChapterTone,
  DisplaySize,
  DisplayTitle,
  Eyebrow,
  Orbit,
  StoryChapter,
  TextLink,
  TitleFace,
} from '@/design-system';
import { CHAPTER_LABELS, TRUTHS } from '@/features/home/home-content';

export function TruthsChapter(): ReactElement {
  return (
    <StoryChapter
      id="ba-goc-nhin"
      tone={ChapterTone.Dawn}
      label={CHAPTER_LABELS.truths}
      className="overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-day via-transparent to-day"
      />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-24 md:px-12 md:py-32 lg:grid-cols-12 lg:gap-8 lg:pr-32 2xl:pr-12">
        <div className="relative flex flex-col gap-4 lg:col-span-3">
          <Orbit
            rings={2}
            className="pointer-events-none absolute top-1/2 -left-24 -z-10 w-72 -translate-y-1/2 text-ink opacity-15"
          />
          <Eyebrow>{TRUTHS.eyebrow}</Eyebrow>
          <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
            {TRUTHS.title}
          </DisplayTitle>
        </div>
        <ol className="grid gap-5 lg:col-span-9 lg:grid-cols-3">
          {TRUTHS.points.map((point, index) => (
            <li
              key={point.title}
              className="flex flex-col gap-4 rounded-2xl border border-gold/40 bg-day/70 p-6 shadow-lg shadow-gold/20 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="font-emphasis text-5xl leading-none font-semibold text-ember italic"
                >
                  {index + 1}
                </span>
                <h3 className="font-emphasis text-xl leading-snug font-bold">{point.title}</h3>
              </div>
              <p className="flex-1 text-sm leading-relaxed">{point.description}</p>
              <div>
                <TextLink to="/kien-thuc">
                  {point.linkLabel} <span aria-hidden="true">→</span>
                </TextLink>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </StoryChapter>
  );
}
