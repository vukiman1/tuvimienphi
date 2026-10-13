import type { LuanGiaiArticle, LuanGiaiSection } from '@org/shared-contracts';
import { Gender, type TaiBachBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from './prompt/chapter-schema';
import {
  KHUNG_TAI_BACH,
  TAI_BACH_CLOSING_LABEL,
  TAI_BACH_EYEBROW,
  TAI_BACH_TITLE,
} from './prompt/khung-tai-bach';

const NHAN_GIOI_TINH: Record<Gender, string> = { [Gender.Nam]: 'Nam', [Gender.Nu]: 'Nữ' };

export function assembleTaiBachArticle(
  brief: TaiBachBrief,
  paragraphs: ThanCuParagraphs,
  sections: readonly LuanGiaiSection[] = [],
): LuanGiaiArticle {
  return {
    eyebrow: TAI_BACH_EYEBROW,
    title: TAI_BACH_TITLE,
    sourceCung: brief.cung,
    quote: KHUNG_TAI_BACH.quote,
    subheading: `${NHAN_GIOI_TINH[brief.gioiTinh]} tuổi ${brief.chiNamSinh} – ${TAI_BACH_TITLE}`,
    paragraphs: [KHUNG_TAI_BACH.moBai, paragraphs.doan1, paragraphs.doan2],
    ...(sections.length > 0 ? { sections } : {}),
    summary: KHUNG_TAI_BACH.summary,
    closingLabel: TAI_BACH_CLOSING_LABEL,
    closing: KHUNG_TAI_BACH.closing,
  };
}
