import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import { Gender, type MenhBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from './prompt/chapter-schema';
import { KHUNG_MENH, MENH_CLOSING_LABEL, MENH_EYEBROW, MENH_TITLE } from './prompt/khung-menh';

const NHAN_GIOI_TINH: Record<Gender, string> = { [Gender.Nam]: 'Nam', [Gender.Nu]: 'Nữ' };

/**
 * Ghép bài: bốn mẩu văn cố định của chương, hai đoạn giữa do mô hình viết. Chương này chỉ có một
 * khung vì nó luôn đọc cung Mệnh.
 */
export function assembleMenhArticle(
  brief: MenhBrief,
  paragraphs: ThanCuParagraphs,
  sections: readonly LuanGiaiSection[] = [],
): LuanGiaiArticle {
  return {
    eyebrow: MENH_EYEBROW,
    title: MENH_TITLE,
    sourceCung: brief.cung,
    quote: KHUNG_MENH.quote,
    subheading: `${NHAN_GIOI_TINH[brief.gioiTinh]} tuổi ${brief.chiNamSinh} – ${MENH_TITLE}`,
    paragraphs: [KHUNG_MENH.moBai, paragraphs.doan1, paragraphs.doan2],
    ...(sections.length > 0 ? { sections } : {}),
    summary: KHUNG_MENH.summary,
    closingLabel: MENH_CLOSING_LABEL,
    closing: KHUNG_MENH.closing,
  };
}
