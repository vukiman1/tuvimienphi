import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { checkAttribution } from './check-attribution';
import { checkContent } from './check-content';
import { checkForbiddenPhrases, checkStyle } from './check-forbidden-phrases';
import { checkForm } from './check-form';
import { checkPosition } from './check-position';

/**
 * Năm tầng kiểm, mỗi tầng bắt một loại lỗi bốn tầng kia không thấy. Toàn bộ là hàm thuần trên
 * `(brief, bài)`, không tốn một lượt gọi mô hình nào.
 *
 * `conLuotDeSinhLai` tách lỗi văn phong khỏi lỗi sai: còn lượt thì đòi cả hai, hết lượt thì chỉ giữ
 * phần bắt buộc. Bài đọc hơi khô vẫn hơn là người dùng nhận 503.
 */
export function checkParagraphs(
  brief: ThanCuBrief,
  paragraphs: ThanCuParagraphs,
  conLuotDeSinhLai = true,
): string[] {
  return [
    ...checkForm(brief, paragraphs),
    ...checkContent(brief, paragraphs),
    ...checkAttribution(brief, paragraphs),
    ...checkForbiddenPhrases(brief, paragraphs),
    ...checkPosition(brief, paragraphs),
    ...(conLuotDeSinhLai ? checkStyle(paragraphs) : []),
  ];
}
