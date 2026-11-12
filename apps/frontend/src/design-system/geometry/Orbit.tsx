import type { CSSProperties, ReactElement } from 'react';
import { pointsOnCircle } from './points-on-circle';

const VIEW_BOX_HALF = 50;
const OUTER_RADIUS = 48;
const RING_STEP = 0.2;
const POINT_RADIUS = 1.2;
const DEFAULT_RINGS = 3;
const ROUND = 1;

interface OrbitProps {
  readonly rings?: number;
  readonly points?: number;
  readonly verticalScale?: number;
  readonly pointRadius?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function Orbit({
  rings = DEFAULT_RINGS,
  points = 0,
  verticalScale = ROUND,
  pointRadius = POINT_RADIUS,
  className,
  style,
}: OrbitProps): ReactElement {
  const ringRadii = Array.from(
    { length: rings },
    (_, index) => OUTER_RADIUS * (1 - index * RING_STEP),
  );
  const halfHeight = VIEW_BOX_HALF * verticalScale;
  return (
    <svg
      viewBox={`${-VIEW_BOX_HALF} ${-halfHeight} ${VIEW_BOX_HALF * 2} ${halfHeight * 2}`}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      {ringRadii.map((radius) => (
        <ellipse
          key={radius}
          rx={radius}
          ry={radius * verticalScale}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {pointsOnCircle(points, OUTER_RADIUS).map(({ x, y }) => (
        <circle
          key={`${x}:${y}`}
          cx={x}
          cy={y * verticalScale}
          r={pointRadius}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
