import { type ReactElement, useRef } from 'react';
import {
  ChapterTone,
  DisplaySize,
  DisplayTitle,
  Eyebrow,
  StoryChapter,
  useSectionProgress,
} from '@/design-system';
import { CHAPTER_LABELS, TURN } from '@/features/home/home-content';

const WORDS = TURN.sentence.split(' ');
const DIM_OPACITY = 0.22;
const REVEAL_SPEED = 1.25;
const REVEAL_SHARPNESS = 8;

function wordOpacity(progress: number, index: number): number {
  const reveal = (progress * REVEAL_SPEED - index / WORDS.length) * REVEAL_SHARPNESS;
  return DIM_OPACITY + (1 - DIM_OPACITY) * Math.min(1, Math.max(0, reveal));
}

export function TurnChapter(): ReactElement {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { progress, isLive } = useSectionProgress(sceneRef);

  return (
    <StoryChapter
      id="hieu-dung"
      tone={ChapterTone.Ember}
      label={CHAPTER_LABELS.turn}
      className="md:h-[140vh] motion-reduce:md:h-auto"
    >
      <div ref={sceneRef} className="h-full">
        <div className="py-24 md:sticky md:top-0 md:flex md:h-svh md:items-center md:py-0 motion-reduce:md:static motion-reduce:md:py-28">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 md:px-12">
            <Eyebrow>{TURN.eyebrow}</Eyebrow>
            <DisplayTitle size={DisplaySize.Chapter}>
              {WORDS.map((word, index) => (
                <span
                  key={`${index}:${word}`}
                  style={isLive ? { opacity: wordOpacity(progress, index) } : undefined}
                >
                  {index === 0 ? word : ` ${word}`}
                </span>
              ))}
            </DisplayTitle>
          </div>
        </div>
      </div>
    </StoryChapter>
  );
}
