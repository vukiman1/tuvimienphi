import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import { Gender, type CongDanhBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from './prompt/chapter-schema';
import {
  CONG_DANH_CLOSING_LABEL,
  CONG_DANH_EYEBROW,
  CONG_DANH_TITLE,
  KHUNG_CONG_DANH,
} from './prompt/khung-cong-danh';

const NHAN_GIOI_TINH: Record<Gender, string> = { [Gender.Nam]: 'Nam', [Gender.Nu]: 'Nữ' };

export function assembleCongDanhArticle(
  brief: CongDanhBrief,
  paragraphs: ThanCuParagraphs,
  sections: readonly LuanGiaiSection[] = [],
): LuanGiaiArticle {
  return {
    eyebrow: CONG_DANH_EYEBROW,
    title: CONG_DANH_TITLE,
    sourceCung: brief.cung,
    quote: KHUNG_CONG_DANH.quote,
    subheading: `${NHAN_GIOI_TINH[brief.gioiTinh]} tuổi ${brief.chiNamSinh} – ${CONG_DANH_TITLE}`,
    paragraphs: [KHUNG_CONG_DANH.moBai, paragraphs.doan1, paragraphs.doan2],
    ...(sections.length > 0 ? { sections } : {}),
    summary: KHUNG_CONG_DANH.summary,
    closingLabel: CONG_DANH_CLOSING_LABEL,
    closing: KHUNG_CONG_DANH.closing,
  };
}
