import { type ReactElement, useRef } from 'react';
import {
  BriefcaseBusiness,
  Heart,
  Hourglass,
  Layers,
  type LucideIcon,
  Star,
  UserRound,
} from 'lucide-react';
import {
  ChapterTone,
  CtaButton,
  CtaTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  StoryChapter,
  TitleFace,
  useSectionProgress,
} from '@/design-system';
import { MEDIA } from '@/config/media';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { CHAPTER_LABELS, MAP, StatementIcon } from '@/features/home/home-content';
import { cn } from '@/lib/utils';
import type { CungName } from '@org/shared-tu-vi';
import { BoardCompass, BoardCorners } from './BoardOrnaments';
import { GOLD_ICON_COLOR } from './GoldIconGradient';
import { BOARD_CELLS, activeStatementIndex } from './story-board';

const STATEMENT_ICONS: Readonly<Record<StatementIcon, LucideIcon>> = {
  [StatementIcon.Person]: UserRound,
  [StatementIcon.Palaces]: Layers,
  [StatementIcon.Stars]: Star,
  [StatementIcon.Love]: Heart,
  [StatementIcon.Career]: BriefcaseBusiness,
  [StatementIcon.Timeline]: Hourglass,
};

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
          <img
            alt=""
            decoding="async"
            fetchPriority="low"
            loading="lazy"
            sizes="100vw"
            src={MEDIA.story.duskPineLarge}
            srcSet={`${MEDIA.story.duskPineSmall} 768w, ${MEDIA.story.duskPineLarge} 1536w`}
            className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-left"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-dusk/70 lg:bg-transparent lg:bg-linear-to-r lg:from-dusk/85 lg:via-dusk/40 lg:to-dusk/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-b from-transparent to-dusk pinned:hidden"
          />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:px-12 lg:grid-cols-12 lg:gap-8 lg:pr-32 2xl:pr-12">
            <div className="flex flex-col items-start gap-4 lg:col-span-3">
              <Eyebrow>{MAP.eyebrow}</Eyebrow>
              <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
                {MAP.title} <Emphasis isAccent>{MAP.emphasis}</Emphasis>
              </DisplayTitle>
              <p className="text-lg">{MAP.subtitle}</p>
              <div className="mt-2">
                <CtaButton tone={CtaTone.Gold} to="/" hash={BIRTH_FORM_ANCHOR}>
                  {MAP.ctaLabel} <span aria-hidden="true">→</span>
                </CtaButton>
              </div>
            </div>

            <div
              role="img"
              aria-label={MAP.boardLabel}
              className="relative grid aspect-square w-full max-w-xl grid-cols-4 grid-rows-4 justify-self-center rounded-xl border border-gold/80 bg-night/40 p-2 shadow-glow-gold backdrop-blur-sm lg:col-span-4"
            >
              <BoardCorners />
              {BOARD_CELLS.map(({ name, row, column }) => (
                <span
                  key={name}
                  style={{ gridRow: row, gridColumn: column }}
                  className={cn(
                    'grid place-items-center border border-gold/50 p-1 text-center text-2xs font-semibold text-day transition-[color,box-shadow,background-color] motion-reduce:transition-none sm:text-sm',
                    highlighted.includes(name) &&
                      'z-10 border-gold bg-gold/15 text-dawn shadow-glow-gold-strong',
                  )}
                >
                  {name}
                </span>
              ))}
              <span
                aria-hidden="true"
                style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
                className="grid place-items-center border border-gold/50"
              >
                <BoardCompass />
              </span>
            </div>

            <ol className="flex flex-col gap-4 lg:col-span-5">
              {MAP.statements.map((statement, index) => {
                const Icon = STATEMENT_ICONS[statement.icon];
                const isActive = index === activeIndex;
                return (
                  <li
                    key={statement.title}
                    aria-current={isActive ? 'step' : undefined}
                    className={cn(
                      'flex items-center gap-4 transition-colors motion-reduce:transition-none',
                      activeIndex !== null && !isActive && 'text-day-soft',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-12 shrink-0 place-items-center rounded-full border bg-night/40 transition-[border-color,box-shadow,background-color] motion-reduce:transition-none',
                        isActive
                          ? 'border-gold bg-gold/20 shadow-glow-gold-strong'
                          : 'border-gold/70 shadow-glow-gold',
                      )}
                    >
                      <Icon
                        className="size-6 drop-shadow-glow-gold"
                        color={GOLD_ICON_COLOR}
                        strokeWidth={2}
                      />
                    </span>
                    <div className="flex flex-col">
                      <h3 className="font-display text-lg font-bold">{statement.title}</h3>
                      <p className="text-sm">{statement.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </StoryChapter>
  );
}
