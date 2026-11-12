import type { ReactElement } from 'react';
import {
  ChartColumn,
  Infinity as InfinityIcon,
  type LucideIcon,
  ShieldCheck,
  Target,
} from 'lucide-react';
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
import { AssuranceIcon, CHAPTER_LABELS, YOUR_STORY } from '@/features/home/home-content';
import { BirthForm } from '@/features/la-so/components/birth-form';
import type { Gender } from '@/features/la-so/birth-input';

const ASSURANCE_ICONS: Readonly<Record<AssuranceIcon, LucideIcon>> = {
  [AssuranceIcon.Accuracy]: Target,
  [AssuranceIcon.Clarity]: ChartColumn,
  [AssuranceIcon.Privacy]: ShieldCheck,
  [AssuranceIcon.Free]: InfinityIcon,
};

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
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-24 md:px-12 md:py-32 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Eyebrow>{YOUR_STORY.eyebrow}</Eyebrow>
          <DisplayTitle size={DisplaySize.Card}>
            {YOUR_STORY.titleStart} <Emphasis>{YOUR_STORY.emphasis}</Emphasis>
          </DisplayTitle>
        </div>

        <div className="relative lg:col-span-6">
          <Orbit
            rings={2}
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[130%] -translate-x-1/2 -translate-y-1/2 text-gold opacity-50"
          />
          <div className="rounded-3xl border border-ink/10 bg-day/85 p-6 shadow-xl backdrop-blur-sm md:p-8">
            <BirthForm initialGender={initialGender} viewYear={viewYear} />
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-5 lg:col-span-3 lg:grid-cols-1">
          {YOUR_STORY.assurances.map(({ label, icon }) => {
            const Icon = ASSURANCE_ICONS[icon];
            return (
              <li key={label} className="flex items-center gap-3 text-sm font-semibold">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-gold bg-day"
                >
                  <Icon className="size-5 text-ink" strokeWidth={1.75} />
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </StoryChapter>
  );
}
