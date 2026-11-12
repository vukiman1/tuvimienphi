import { type CSSProperties, type ReactElement, useRef } from 'react';
import {
  ChapterTone,
  Eyebrow,
  GiantNumeral,
  Orbit,
  StoryChapter,
  pointsOnCircle,
  useSectionProgress,
} from '@/design-system';
import { MEDIA } from '@/config/media';
import { CHAPTER_LABELS, MOMENT } from '@/features/home/home-content';

const SCATTER_RADIUS_VMIN = 30;
const ASSEMBLY_START = 0.08;
const ASSEMBLY_SPAN = 0.8;
const SCATTERED_SCALE = 0.22;
const SCATTERED_OPACITY = 0.35;
const ORBIT_START_OPACITY = 0.25;
const ORBIT_OPACITY_RANGE = 0.65;
const ORBIT_VERTICAL_SCALE_NARROW = 0.8;
const ORBIT_VERTICAL_SCALE_WIDE = 0.42;
const ORBIT_POINT_RADIUS = 0.7;

function scatterAmount(progress: number): number {
  const assembled = Math.min(1, Math.max(0, (progress - ASSEMBLY_START) / ASSEMBLY_SPAN));
  return 1 - assembled;
}

function scatteredStyles(amount: number): readonly CSSProperties[] {
  return pointsOnCircle(MOMENT.parts.length, SCATTER_RADIUS_VMIN).map(({ x, y }) => ({
    transform: `translate3d(${x * amount}vmin, ${y * amount}vmin, 0) scale(${1 - (1 - SCATTERED_SCALE) * amount})`,
    opacity: 1 - (1 - SCATTERED_OPACITY) * amount,
  }));
}

export function MomentChapter(): ReactElement {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { progress, isLive } = useSectionProgress(sceneRef);
  const amount = isLive ? scatterAmount(progress) : 0;
  const orbitStyle: CSSProperties = {
    opacity: ORBIT_START_OPACITY + ORBIT_OPACITY_RANGE * (1 - amount),
  };

  return (
    <StoryChapter
      id="khoanh-khac"
      tone={ChapterTone.Deep}
      label={CHAPTER_LABELS.moment}
      className="h-[145vh] md:h-[205vh] motion-reduce:h-auto motion-reduce:md:h-auto"
    >
      <div ref={sceneRef} className="h-full">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden motion-reduce:static motion-reduce:py-28">
          <img
            alt=""
            decoding="async"
            fetchPriority="low"
            loading="lazy"
            sizes="100vw"
            src={MEDIA.story.starLakeLarge}
            srcSet={`${MEDIA.story.starLakeSmall} 768w, ${MEDIA.story.starLakeLarge} 1536w`}
            className="pointer-events-none absolute inset-0 -z-10 size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-radial from-deep/70 via-deep/30 to-transparent"
          />
          <Orbit
            rings={1}
            points={12}
            verticalScale={ORBIT_VERTICAL_SCALE_NARROW}
            pointRadius={ORBIT_POINT_RADIUS}
            className="pointer-events-none absolute top-1/2 left-1/2 w-[120vw] -translate-x-1/2 -translate-y-1/2 text-gold md:hidden"
            style={orbitStyle}
          />
          <Orbit
            rings={1}
            points={12}
            verticalScale={ORBIT_VERTICAL_SCALE_WIDE}
            pointRadius={ORBIT_POINT_RADIUS}
            className="pointer-events-none absolute top-1/2 left-1/2 hidden w-[min(82vw,72rem)] -translate-x-1/2 -translate-y-1/2 text-gold md:block"
            style={orbitStyle}
          />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 text-center">
            <Eyebrow>{MOMENT.eyebrow}</Eyebrow>
            <GiantNumeral
              parts={MOMENT.parts}
              label={MOMENT.label}
              partStyles={isLive ? scatteredStyles(amount) : undefined}
              className="text-[clamp(2.3rem,10.6vw,11.5rem)] will-change-transform"
            />
            <p className="max-w-xl text-lg">{MOMENT.caption}</p>
          </div>
        </div>
      </div>
    </StoryChapter>
  );
}
