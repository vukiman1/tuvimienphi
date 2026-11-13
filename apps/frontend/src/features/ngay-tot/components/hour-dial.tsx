import type { ReactElement } from 'react';
import { pointsOnCircle } from '@/design-system';
import { cn } from '@/lib/utils';

const CHI_COUNT = 12;
const VIEW_BOX_HALF = 50;
const DIAL_RADIUS = 36;
const POINT_RADIUS = 4;
const LIT_POINT_RADIUS = 9;
const LIT_POINT_STROKE = 3;
const RING_STROKE = 2;
const VIEW_BOX = `${-VIEW_BOX_HALF} ${-VIEW_BOX_HALF} ${VIEW_BOX_HALF * 2} ${VIEW_BOX_HALF * 2}`;

interface HourDialProps {
  readonly chiIndex: number;
  readonly className?: string;
}

export function HourDial({ chiIndex, className }: HourDialProps): ReactElement {
  return (
    <svg aria-hidden="true" className={className} focusable="false" viewBox={VIEW_BOX}>
      <circle className="stroke-ink/20" fill="none" r={DIAL_RADIUS} strokeWidth={RING_STROKE} />
      {pointsOnCircle(CHI_COUNT, DIAL_RADIUS).map(({ x, y }, index) => {
        const isLit = index === chiIndex;
        return (
          <circle
            key={`${x}:${y}`}
            className={cn(isLit ? 'fill-gold stroke-ink' : 'fill-ink-soft')}
            cx={x}
            cy={y}
            r={isLit ? LIT_POINT_RADIUS : POINT_RADIUS}
            strokeWidth={isLit ? LIT_POINT_STROKE : undefined}
          />
        );
      })}
    </svg>
  );
}
