import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import { Gender, type CungBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from './prompt/chapter-schema';
import type { KhungChuong } from './prompt/khung-chuong';

const NHAN_GIOI_TINH: Record<Gender, string> = { [Gender.Nam]: 'Nam', [Gender.Nu]: 'Nữ' };

export function assembleCungArticle(
  khung: KhungChuong,
  brief: CungBrief,
  paragraphs: ThanCuParagraphs,
  sections: readonly LuanGiaiSection[] = [],
): LuanGiaiArticle {
  return {
    eyebrow: khung.eyebrow,
    title: khung.title,
    sourceCung: brief.cung,
    quote: khung.quote,
    subheading: `${NHAN_GIOI_TINH[brief.gioiTinh]} tuổi ${brief.chiNamSinh} – ${khung.title}`,
    paragraphs: [khung.moBai, paragraphs.doan1, paragraphs.doan2],
    ...(sections.length > 0 ? { sections } : {}),
    summary: khung.summary,
    closingLabel: khung.closingLabel,
    closing: khung.closing,
  };
}
