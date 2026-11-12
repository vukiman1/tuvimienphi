import { type ReactElement, useRef } from 'react';
import {
  ChapterTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  StoryChapter,
  TitleFace,
  useSectionProgress,
} from '@/design-system';
import { MEDIA } from '@/config/media';
import { CHAPTER_LABELS, TURN } from '@/features/home/home-content';

interface TurnWord {
  readonly text: string;
  readonly isEmphasis: boolean;
}

const WORDS: readonly TurnWord[] = TURN.phrases.flatMap(({ text, isEmphasis }) =>
  text.split(' ').map((word) => ({ text: word, isEmphasis })),
);
const DIM_OPACITY = 0.22;
const REVEAL_SPEED = 1.25;
const REVEAL_SHARPNESS = 8;

function wordOpacity(progress: number, index: number): number {
  const reveal = (progress * REVEAL_SPEED - index / WORDS.length) * REVEAL_SHARPNESS;
  return DIM_OPACITY + (1 - DIM_OPACITY) * Math.min(1, Math.max(0, reveal));
}

function EyebrowRule(): ReactElement {
  return <span aria-hidden="true" className="h-px w-12 bg-current opacity-50 md:w-24" />;
}

export function TurnChapter(): ReactElement {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { progress, isLive } = useSectionProgress(sceneRef);

  return (
    <StoryChapter
      id="hieu-dung"
      tone={ChapterTone.Dusk}
      label={CHAPTER_LABELS.turn}
      className="md:h-[140vh] motion-reduce:md:h-auto"
    >
      <div ref={sceneRef} className="h-full">
        <div className="py-24 md:sticky md:top-0 md:flex md:h-svh md:items-center md:py-0 motion-reduce:md:static motion-reduce:md:py-28">
          <img
            alt=""
            decoding="async"
            fetchPriority="low"
            loading="lazy"
            sizes="100vw"
            src={MEDIA.story.sunsetLarge}
            srcSet={`${MEDIA.story.sunsetSmall} 768w, ${MEDIA.story.sunsetLarge} 1536w`}
            className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-[center_25%]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-dusk/85 via-dusk/80 to-dusk/40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/6 bg-linear-to-b from-transparent to-day"
          />
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 text-center md:px-12">
            <div className="flex items-center gap-4">
              <EyebrowRule />
              <Eyebrow>{TURN.eyebrow}</Eyebrow>
              <EyebrowRule />
            </div>
            <DisplayTitle size={DisplaySize.Chapter} face={TitleFace.Serif}>
              {WORDS.map((word, index) => (
                <span
                  key={`${index}:${word.text}`}
                  style={isLive ? { opacity: wordOpacity(progress, index) } : undefined}
                >
                  {index === 0 ? '' : ' '}
                  {word.isEmphasis ? <Emphasis isAccent>{word.text}</Emphasis> : word.text}
                </span>
              ))}
            </DisplayTitle>
          </div>
        </div>
      </div>
    </StoryChapter>
  );
}
