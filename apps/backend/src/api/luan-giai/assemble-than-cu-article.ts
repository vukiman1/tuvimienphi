import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import { Gender, type ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from './prompt/chapter-schema';
import {
  KHUNG_THAN_CU,
  THAN_CU_CLOSING_LABEL,
  THAN_CU_EYEBROW,
  type ThanCuCung,
} from './prompt/khung-than-cu';

const NHAN_GIOI_TINH: Record<Gender, string> = { [Gender.Nam]: 'Nam', [Gender.Nu]: 'Nữ' };

/**
 * Ghép bài: bốn mẩu văn cố định lấy từ bảng khung theo cung an Thân, hai đoạn giữa do mô hình viết.
 * Mô hình chỉ chạm vào hai đoạn đó, phần còn lại của bài không đi qua nó.
 */
export function assembleThanCuArticle(
  brief: ThanCuBrief,
  paragraphs: ThanCuParagraphs,
  sections: readonly LuanGiaiSection[] = [],
): LuanGiaiArticle {
  const khung = KHUNG_THAN_CU[brief.cungThan as ThanCuCung];
  const tieuDe = `Thân cư ${brief.cungThan}`;

  return {
    eyebrow: THAN_CU_EYEBROW,
    title: tieuDe,
    quote: khung.quote,
    subheading: `${NHAN_GIOI_TINH[brief.gioiTinh]} tuổi ${brief.chiNamSinh} – ${tieuDe}`,
    paragraphs: [khung.moBai, paragraphs.doan1, paragraphs.doan2],
    ...(sections.length > 0 ? { sections } : {}),
    summary: khung.summary,
    closingLabel: THAN_CU_CLOSING_LABEL,
    closing: khung.closing,
  };
}
