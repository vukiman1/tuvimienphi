import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import { Gender, type ChapterBrief } from '@org/shared-tu-vi';
import type { DoanChinh } from '../generation/chapter-schema';
import type { KhungChuong } from './khung-chuong';

const NHAN_GIOI_TINH: Record<Gender, string> = { [Gender.Nam]: 'Nam', [Gender.Nu]: 'Nữ' };

export function assembleArticle(
  khung: KhungChuong,
  brief: ChapterBrief,
  doan: DoanChinh,
  sections: readonly LuanGiaiSection[],
): LuanGiaiArticle {
  return {
    eyebrow: khung.eyebrow,
    title: khung.title,
    sourceCung: brief.cung,
    quote: khung.quote,
    subheading: `${NHAN_GIOI_TINH[brief.gioiTinh]} tuổi ${brief.chiNamSinh} – ${khung.title}`,
    paragraphs: [khung.moBai, doan.doan1, doan.doan2],
    ...(sections.length > 0 ? { sections } : {}),
    summary: khung.summary,
    closingLabel: khung.closingLabel,
    closing: khung.closing,
  };
}
