import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

const RAY_ANGLES = [0, 45, 90, 135] as const;
const RAY_TIP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;
const OUTER_RING_RADIUS = 44;
const MIDDLE_RING_RADIUS = 30;
const INNER_RING_RADIUS = 14;
const RAY_HALF_LENGTH = 46;
const FAINT_LINE_OPACITY = 0.35;
const MIDDLE_RING_OPACITY = 0.5;
const RAY_TIP_RADIUS = 1.4;
const CENTRE_DOT_RADIUS = 2.4;
const CORNER_STROKE_WIDTH = 1.5;
const CORNER_INNER_STROKE_WIDTH = 1;
const CORNER_DOT_OFFSET = 5;
const CORNER_DOT_RADIUS = 1.6;
const CORNERS = [
  { position: 'top-1 left-1', rotation: '' },
  { position: 'top-1 right-1', rotation: 'rotate-90' },
  { position: 'right-1 bottom-1', rotation: 'rotate-180' },
  { position: 'bottom-1 left-1', rotation: '-rotate-90' },
] as const;

export function BoardCompass(): ReactElement {
  return (
    <svg
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      focusable="false"
      className="w-11/12 text-gold"
    >
      <circle
        r={OUTER_RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity={FAINT_LINE_OPACITY}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        r={MIDDLE_RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity={MIDDLE_RING_OPACITY}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        r={INNER_RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity={FAINT_LINE_OPACITY}
        vectorEffect="non-scaling-stroke"
      />
      {RAY_ANGLES.map((angle) => (
        <line
          key={angle}
          x1={-RAY_HALF_LENGTH}
          x2={RAY_HALF_LENGTH}
          stroke="currentColor"
          strokeOpacity={FAINT_LINE_OPACITY}
          vectorEffect="non-scaling-stroke"
          transform={`rotate(${angle})`}
        />
      ))}
      {RAY_TIP_ANGLES.map((angle) => (
        <circle
          key={angle}
          cx={OUTER_RING_RADIUS}
          r={RAY_TIP_RADIUS}
          fill="currentColor"
          transform={`rotate(${angle})`}
          className="drop-shadow-glow-gold"
        />
      ))}
      <path
        d="M0 -12 L2.2 -2.2 L12 0 L2.2 2.2 L0 12 L-2.2 2.2 L-12 0 L-2.2 -2.2 Z"
        fill="currentColor"
        className="drop-shadow-glow-gold"
      />
      <circle r={CENTRE_DOT_RADIUS} className="fill-day drop-shadow-glow-gold" />
    </svg>
  );
}

export function BoardCorners(): ReactElement {
  return (
    <>
      {CORNERS.map(({ position, rotation }) => (
        <svg
          key={position}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={cn(
            'pointer-events-none absolute size-5 text-gold md:size-6',
            position,
            rotation,
          )}
        >
          <path
            d="M2 14 V5 Q2 2 5 2 H14"
            fill="none"
            stroke="currentColor"
            strokeWidth={CORNER_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <path
            d="M6 9 Q6 6 9 6"
            fill="none"
            stroke="currentColor"
            strokeWidth={CORNER_INNER_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <circle
            cx={CORNER_DOT_OFFSET}
            cy={CORNER_DOT_OFFSET}
            r={CORNER_DOT_RADIUS}
            fill="currentColor"
            className="drop-shadow-glow-gold"
          />
        </svg>
      ))}
    </>
  );
}
