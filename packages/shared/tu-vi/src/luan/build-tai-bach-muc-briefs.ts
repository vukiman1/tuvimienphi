import type { NatalChart } from '../cast-chart.js';
import { BANG_TAI_BACH } from './bang/tai-bach/bang-tai-bach.js';
import {
  buildPhuTinhMucBriefs,
  type CungMucBrief,
  type PhuTinhMucKey,
} from './build-cung-muc-briefs.js';

export function buildTaiBachMucBriefs(chart: NatalChart): readonly CungMucBrief<PhuTinhMucKey>[] {
  return buildPhuTinhMucBriefs(chart, BANG_TAI_BACH, 'tài chính');
}
