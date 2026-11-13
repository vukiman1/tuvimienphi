import { nhiHopIndex, tamHopIndexes, xungChieuIndex } from '@org/shared-tu-vi';
import { centerAnchor, type BoardPoint } from './board-layout';
import type { ChartView, CungView } from './chart-types';

const BLOCKED_PAIR_SIZE = 2;

export interface BoardSegment {
  readonly from: BoardPoint;
  readonly to: BoardPoint;
}

export interface BoardHighlights {
  readonly related: ReadonlySet<number>;
  readonly tamHopEdges: readonly BoardSegment[];
  readonly xungChieu: BoardSegment;
  readonly tuan: readonly [number, number] | null;
  readonly triet: readonly [number, number] | null;
}

function blockedPair(
  chart: ChartView,
  isBlocked: (cung: CungView) => boolean,
): readonly [number, number] | null {
  const indexes = chart.cungs.filter(isBlocked).map((cung) => cung.index);
  return indexes.length === BLOCKED_PAIR_SIZE ? [indexes[0], indexes[1]] : null;
}

function closedPolygon(points: readonly BoardPoint[]): readonly BoardSegment[] {
  return points.map((from, index) => ({ from, to: points[(index + 1) % points.length] }));
}

export function boardHighlights(chart: ChartView, focusedIndex: number): BoardHighlights {
  const tamHop = tamHopIndexes(focusedIndex);
  const xungChieu = xungChieuIndex(focusedIndex);
  const triangle = [focusedIndex, ...tamHop].map(centerAnchor);

  return {
    related: new Set([...tamHop, xungChieu, nhiHopIndex(focusedIndex)]),
    tamHopEdges: closedPolygon(triangle),
    xungChieu: { from: triangle[0], to: centerAnchor(xungChieu) },
    tuan: blockedPair(chart, (cung) => cung.hasTuan),
    triet: blockedPair(chart, (cung) => cung.hasTriet),
  };
}
