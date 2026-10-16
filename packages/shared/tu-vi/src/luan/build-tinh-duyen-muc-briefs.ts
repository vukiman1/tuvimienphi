import type { NatalChart } from '../cast-chart.js';
import { BANG_PHU_MAU } from './bang/phu-mau/bang-phu-mau.js';
import { BANG_PHU_THE } from './bang/phu-the/bang-phu-the.js';
import { BANG_TU_TUC } from './bang/tu-tuc/bang-tu-tuc.js';
import {
  buildCungMucBrief,
  buildPhuTinhMucBriefs,
  type CungMucBrief,
  type PhuTinhMucKey,
} from './build-cung-muc-briefs.js';

export enum GiaDaoMucKey {
  ConCai = 'con-cai',
  ChaMe = 'cha-me',
}

export function buildTinhDuyenMucBriefs(chart: NatalChart): readonly CungMucBrief<PhuTinhMucKey>[] {
  return buildPhuTinhMucBriefs(chart, BANG_PHU_THE, 'tình duyên');
}

export function buildGiaDaoMucBriefs(chart: NatalChart): readonly CungMucBrief<GiaDaoMucKey>[] {
  return [
    buildCungMucBrief(chart, BANG_TU_TUC, GiaDaoMucKey.ConCai, 'Con cái'),
    buildCungMucBrief(chart, BANG_PHU_MAU, GiaDaoMucKey.ChaMe, 'Cha mẹ'),
  ].filter((muc): muc is CungMucBrief<GiaDaoMucKey> => muc !== null);
}
