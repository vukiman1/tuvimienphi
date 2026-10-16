import type { NatalChart } from '../cast-chart.js';
import { BANG_QUAN_LOC } from './bang/quan-loc/bang-quan-loc.js';
import { buildCungBrief, type CungBrief } from './build-cung-brief.js';

export function buildCongDanhBrief(chart: NatalChart): CungBrief | null {
  return buildCungBrief(chart, BANG_QUAN_LOC);
}
