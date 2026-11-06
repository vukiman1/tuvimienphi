import { funnelMetric, type FunnelDayRow } from './funnel-metrics';
import type { Window } from './overview-window';

const PREVIOUS: Window = {
  start: new Date('2026-11-01T00:00:00Z'),
  end: new Date('2026-11-04T00:00:00Z'),
  days: 3,
};
const CURRENT: Window = {
  start: new Date('2026-11-04T00:00:00Z'),
  end: new Date('2026-11-07T00:00:00Z'),
  days: 3,
};

function row(day: string, chartCasts: number): FunnelDayRow {
  return { day, chartCasts, chapterUnlocks: chartCasts * 10, paidChapterUnlocks: 0 };
}

describe('funnelMetric', () => {
  it('sums the column over the current window and over the previous window', () => {
    const rows = [
      row('2026-11-01', 2),
      row('2026-11-03', 3),
      row('2026-11-04', 5),
      row('2026-11-06', 7),
    ];

    const metric = funnelMetric(rows, 'chartCasts', CURRENT, PREVIOUS);

    expect(metric.value).toBe(12);
    expect(metric.previous).toBe(5);
  });

  it('reads only the requested column', () => {
    const metric = funnelMetric([row('2026-11-05', 4)], 'chapterUnlocks', CURRENT, PREVIOUS);

    expect(metric.value).toBe(40);
  });

  it('fills every day of the current window, with 0 for days without a row', () => {
    const metric = funnelMetric([row('2026-11-05', 4)], 'chartCasts', CURRENT, PREVIOUS);

    expect(metric.series).toEqual([
      { date: '2026-11-04', count: 0 },
      { date: '2026-11-05', count: 4 },
      { date: '2026-11-06', count: 0 },
    ]);
  });

  it('ignores rows outside both windows', () => {
    const rows = [row('2026-10-31', 100), row('2026-11-07', 100), row('2026-11-05', 1)];

    const metric = funnelMetric(rows, 'chartCasts', CURRENT, PREVIOUS);

    expect(metric.value).toBe(1);
    expect(metric.previous).toBe(0);
  });
});
