import { CalendarType, Gender } from './birth-input';
import { boardHighlights } from './board-highlights';
import { toChartView } from './to-chart-view';

const CUNG_COUNT = 12;
const TY = 0;

const SAMPLE_CHART = toChartView({
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
  viewYear: 2026,
});

function isAdjacentPair(pair: readonly [number, number] | null): boolean {
  if (pair === null) return false;
  const distance = Math.abs(pair[0] - pair[1]);
  return distance === 1 || distance === CUNG_COUNT - 1;
}

describe('boardHighlights', () => {
  it('relates a cung to its tam hợp, xung chiếu and nhị hợp', () => {
    expect(boardHighlights(SAMPLE_CHART, TY).related).toEqual(new Set([4, 8, 6, 1]));
  });

  it('closes the tam hợp triangle', () => {
    const { tamHopEdges } = boardHighlights(SAMPLE_CHART, TY);

    expect(tamHopEdges).toHaveLength(3);
    expect(tamHopEdges[2].to).toEqual(tamHopEdges[0].from);
  });

  it('finds both blocked pairs on a real chart', () => {
    const { tuan, triet } = boardHighlights(SAMPLE_CHART, TY);

    expect(isAdjacentPair(tuan)).toBe(true);
    expect(isAdjacentPair(triet)).toBe(true);
  });
});
