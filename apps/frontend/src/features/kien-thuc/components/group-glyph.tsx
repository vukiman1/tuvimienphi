import type { ReactElement } from 'react';
import { EntryGroup } from '@org/shared-contracts';
import { pointsOnCircle } from '@/design-system/geometry/points-on-circle';

const VIEW_BOX_SIZE = 24;
const GLYPH_RADIUS = 9;
const POINT_RADIUS = 1.4;
const RULE_START_X = 3;
const RULE_END_X = 21;
const RULE_ROWS: readonly number[] = [6, 12, 18];
const RULE_STROKE_WIDTH = 1.5;

const GLYPH_POINTS: Readonly<Record<Exclude<EntryGroup, EntryGroup.ThuatNgu>, number>> = {
  [EntryGroup.ChinhTinh]: 14,
  [EntryGroup.TuHoa]: 4,
  [EntryGroup.PhuTinh]: 8,
  [EntryGroup.Cung]: 12,
  [EntryGroup.NguHanh]: 5,
};

interface GroupGlyphProps {
  readonly group: EntryGroup;
}

export function GroupGlyph({ group }: GroupGlyphProps): ReactElement {
  const half = VIEW_BOX_SIZE / 2;
  return (
    <svg
      viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
      aria-hidden="true"
      focusable="false"
      className="size-6 stroke-ink"
      fill="none"
    >
      {group === EntryGroup.ThuatNgu
        ? RULE_ROWS.map((y) => (
            <line
              key={y}
              x1={RULE_START_X}
              x2={RULE_END_X}
              y1={y}
              y2={y}
              strokeWidth={RULE_STROKE_WIDTH}
              strokeLinecap="round"
            />
          ))
        : pointsOnCircle(GLYPH_POINTS[group], GLYPH_RADIUS).map(({ x, y }) => (
            <circle
              key={`${x}:${y}`}
              cx={half + x}
              cy={half + y}
              r={POINT_RADIUS}
              strokeWidth={RULE_STROKE_WIDTH}
            />
          ))}
    </svg>
  );
}
