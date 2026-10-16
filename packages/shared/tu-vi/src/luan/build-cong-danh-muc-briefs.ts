import type { NatalChart } from '../cast-chart.js';
import { BANG_QUAN_LOC } from './bang/quan-loc/bang-quan-loc.js';
import {
  buildPhuTinhMucBriefs,
  type CungMucBrief,
  type PhuTinhMucKey,
} from './build-cung-muc-briefs.js';

export function buildCongDanhMucBriefs(chart: NatalChart): readonly CungMucBrief<PhuTinhMucKey>[] {
  return buildPhuTinhMucBriefs(chart, BANG_QUAN_LOC, 'sự nghiệp');
}
