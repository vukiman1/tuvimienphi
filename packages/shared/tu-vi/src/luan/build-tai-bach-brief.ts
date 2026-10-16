import type { NatalChart } from '../cast-chart.js';
import { BANG_TAI_BACH } from './bang/tai-bach/bang-tai-bach.js';
import { buildCungBrief, type CungBrief } from './build-cung-brief.js';

export function buildTaiBachBrief(chart: NatalChart): CungBrief | null {
  return buildCungBrief(chart, BANG_TAI_BACH);
}
