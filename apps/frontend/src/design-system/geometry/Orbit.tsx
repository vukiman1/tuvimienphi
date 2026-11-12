import type { CSSProperties, ReactElement } from 'react';
import { pointsOnCircle } from './points-on-circle';

const VIEW_BOX = '-50 -50 100 100';
const OUTER_RADIUS = 48;
const RING_STEP = 0.2;
const POINT_RADIUS = 1.2;
const DEFAULT_RINGS = 3;

interface OrbitProps {
  readonly rings?: number;
  readonly points?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function Orbit({
  rings = DEFAULT_RINGS,
  points = 0,
  className,
  style,
}: OrbitProps): ReactElement {
  const ringRadii = Array.from(
    { length: rings },
    (_, index) => OUTER_RADIUS * (1 - index * RING_STEP),
  );
  return (
    <svg
      viewBox={VIEW_BOX}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      {ringRadii.map((radius) => (
        <circle
          key={radius}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {pointsOnCircle(points, OUTER_RADIUS).map(({ x, y }) => (
        <circle key={`${x}:${y}`} cx={x} cy={y} r={POINT_RADIUS} fill="currentColor" />
      ))}
    </svg>
  );
}
