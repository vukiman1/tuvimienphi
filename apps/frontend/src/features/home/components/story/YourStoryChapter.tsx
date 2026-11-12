import type { ReactElement } from 'react';
import {
  ChapterTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  Orbit,
  StoryChapter,
} from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { CHAPTER_LABELS, YOUR_STORY } from '@/features/home/home-content';
import { BirthForm } from '@/features/la-so/components/birth-form';
import type { Gender } from '@/features/la-so/birth-input';

interface YourStoryChapterProps {
  readonly initialGender?: Gender;
  readonly viewYear?: number;
}

export function YourStoryChapter({ initialGender, viewYear }: YourStoryChapterProps): ReactElement {
  return (
    <StoryChapter
      id={BIRTH_FORM_ANCHOR}
      tone={ChapterTone.Day}
      label={CHAPTER_LABELS.yourStory}
      className="overflow-hidden scroll-mt-24"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-24 md:px-12 md:py-32">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative flex flex-col gap-4">
            <Eyebrow>{YOUR_STORY.eyebrow}</Eyebrow>
            <DisplayTitle size={DisplaySize.Chapter}>
              {YOUR_STORY.titleStart} <Emphasis>{YOUR_STORY.emphasis}</Emphasis>{' '}
              {YOUR_STORY.titleEnd}
            </DisplayTitle>
            <Orbit
              rings={3}
              className="pointer-events-none absolute top-1/2 -left-1/3 -z-10 w-[min(60vw,40rem)] text-gold opacity-60"
            />
          </div>
          <div className="relative rounded-2xl bg-night p-5 text-day md:p-8">
            <h3 className="mb-5 font-display text-2xl font-bold tracking-display">
              {YOUR_STORY.formHeading}
            </h3>
            <BirthForm initialGender={initialGender} viewYear={viewYear} />
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-5 border-t border-ink/30 pt-6 md:grid-cols-4">
          {YOUR_STORY.assurances.map((assurance) => (
            <li key={assurance} className="text-sm font-semibold">
              {assurance}
            </li>
          ))}
        </ul>
      </div>
    </StoryChapter>
  );
}
