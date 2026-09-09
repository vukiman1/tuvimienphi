import { Sac } from '@org/shared-tu-vi';
import type { MucParagraph, ThanCuParagraphs } from '../prompt/chapter-schema';
import type { BaiCanKiem } from './bai-can-kiem';

/** Bài chính: đoạn đầu nhận mệnh đề thuận, đoạn sau nhận nghịch rồi hoá giải. */
export function baiChinh(paragraphs: ThanCuParagraphs): BaiCanKiem {
  return {
    doan: [paragraphs.doan1, paragraphs.doan2],
    doanCuaSac: { [Sac.Thuan]: 0, [Sac.Nghich]: 1, [Sac.HoaGiai]: 1 },
  };
}

/** Mục con chỉ có một đoạn nên mọi sắc thái dồn vào đó. */
export function baiMuc(paragraph: MucParagraph): BaiCanKiem {
  return {
    doan: [paragraph.doan],
    doanCuaSac: { [Sac.Thuan]: 0, [Sac.Nghich]: 0, [Sac.HoaGiai]: 0 },
  };
}
