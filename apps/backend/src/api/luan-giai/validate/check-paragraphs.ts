import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { checkAttribution } from './check-attribution';
import { checkContent } from './check-content';
import { checkForbiddenPhrases } from './check-forbidden-phrases';
import { checkForm } from './check-form';

/**
 * Bốn tầng kiểm, mỗi tầng bắt một loại lỗi ba tầng kia không thấy. Toàn bộ là hàm thuần trên
 * `(brief, bài)`, không tốn một lượt gọi mô hình nào.
 */
export function checkParagraphs(brief: ThanCuBrief, paragraphs: ThanCuParagraphs): string[] {
  return [
    ...checkForm(brief, paragraphs),
    ...checkContent(brief, paragraphs),
    ...checkAttribution(brief, paragraphs),
    ...checkForbiddenPhrases(brief, paragraphs),
  ];
}
