import type { NatalChart } from '../cast-chart.js';
import { BANG_PHU_THE } from './bang/phu-the/bang-phu-the.js';
import { buildCungBrief, type CungBrief } from './build-cung-brief.js';

export function buildTinhDuyenBrief(chart: NatalChart): CungBrief | null {
  return buildCungBrief(chart, BANG_PHU_THE);
}
