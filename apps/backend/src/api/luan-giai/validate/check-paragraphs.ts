import type { ChapterBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';
import { checkAttribution } from './check-attribution';
import { checkContent } from './check-content';
import { checkForbiddenPhrases, checkStyle } from './check-forbidden-phrases';
import { checkForm } from './check-form';
import { checkPosition } from './check-position';

export function checkParagraphs(
  brief: ChapterBrief,
  bai: BaiCanKiem,
  conLuotDeSinhLai = true,
): string[] {
  return [
    ...checkForm(brief, bai),
    ...checkContent(brief, bai),
    ...checkAttribution(brief, bai),
    ...checkForbiddenPhrases(brief, bai),
    ...checkPosition(brief, bai),
    ...(conLuotDeSinhLai ? checkStyle(bai) : []),
  ];
}
