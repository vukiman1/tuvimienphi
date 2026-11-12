import type { ReactElement } from 'react';
import {
  ChartNoAxesColumnIncreasing,
  Infinity as InfinityIcon,
  type LucideIcon,
  Shield,
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
  TitleFace,
} from '@/design-system';
import { MEDIA } from '@/config/media';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { AssuranceIcon, CHAPTER_LABELS, YOUR_STORY } from '@/features/home/home-content';
import { BirthForm } from '@/features/la-so/components/birth-form';
import type { Gender } from '@/features/la-so/birth-input';
import { GOLD_ICON_COLOR } from './GoldIconGradient';

const ASSURANCE_ICONS: Readonly<Record<AssuranceIcon, LucideIcon>> = {
  [AssuranceIcon.Accuracy]: Target,
  [AssuranceIcon.Clarity]: ChartNoAxesColumnIncreasing,
  [AssuranceIcon.Privacy]: Shield,
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
      <img
        alt=""
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        sizes="100vw"
        src={MEDIA.story.sunriseMeadowLarge}
        srcSet={`${MEDIA.story.sunriseMeadowSmall} 768w, ${MEDIA.story.sunriseMeadowLarge} 1536w`}
        className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-bottom"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-day/50 lg:bg-transparent lg:bg-linear-to-r lg:from-day/85 lg:via-day/20 lg:to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/4 bg-linear-to-b from-day to-transparent"
      />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-24 md:px-12 md:py-32 lg:grid-cols-12 lg:gap-10 lg:pr-32 2xl:pr-12">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Eyebrow>{YOUR_STORY.eyebrow}</Eyebrow>
          <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
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

        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:mr-8 lg:grid-cols-1 2xl:mr-0">
          {YOUR_STORY.assurances.map(({ label, icon }) => {
            const Icon = ASSURANCE_ICONS[icon];
            return (
              <li
                key={label}
                className="flex items-center gap-4 rounded-full border border-day bg-day/70 py-2 pr-5 pl-2 text-sm font-semibold shadow-lg backdrop-blur-sm"
              >
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-day shadow-glow-gold"
                >
                  <Icon className="size-7" color={GOLD_ICON_COLOR} strokeWidth={2.75} />
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
