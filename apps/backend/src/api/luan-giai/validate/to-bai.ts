import { Sac } from '@org/shared-tu-vi';
import type { DoanChinh, MucParagraph } from '../generation/chapter-schema';
import type { BaiCanKiem } from './bai-can-kiem';

export function baiChinh(paragraphs: DoanChinh): BaiCanKiem {
  return {
    doan: [paragraphs.doan1, paragraphs.doan2],
    doanCuaSac: { [Sac.Thuan]: 0, [Sac.Nghich]: 1, [Sac.HoaGiai]: 1 },
  };
}

export function baiMuc(paragraph: MucParagraph): BaiCanKiem {
  return {
    doan: [paragraph.doan],
    doanCuaSac: { [Sac.Thuan]: 0, [Sac.Nghich]: 0, [Sac.HoaGiai]: 0 },
  };
}
