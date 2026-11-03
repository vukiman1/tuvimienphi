import type { LuanGiaiSection } from '@org/shared-contracts';
import {
  CHI,
  CUU_DIEU_LOI,
  DAI_VAN_CHU_DE,
  isKimLau,
  isTamTai,
  KIM_LAU_LOI,
  LINH_VUC,
  saoChieuMenh,
  TAM_TAI_LOI,
  VanHanMucKey,
  VanHanTone,
  viewYearPillar,
  type NatalChart,
  type VanHanYear,
} from '@org/shared-tu-vi';
import {
  CHAPTER_CONG_DANH,
  CHAPTER_MENH,
  CHAPTER_TAI_BACH,
  CHAPTER_TINH_DUYEN,
} from '../../luan-giai.constants';
import { KHUNG_CONG_DANH } from '../cong-danh/cong-danh.khung';
import { KHUNG_MENH } from '../menh/menh.khung';
import { KHUNG_TAI_BACH } from '../tai-bach/tai-bach.khung';
import { KHUNG_TINH_DUYEN } from '../tinh-duyen/tinh-duyen.khung';

export const LINH_VUC_TITLE = 'Lĩnh vực nổi bật';
export const VAN_KE_TIEP_TITLE = 'Nhìn trước vận kế tiếp';
export const DAN_GIAN_TITLE = 'Sao chiếu mệnh & hạn tuổi';
export const DAN_GIAN_OPENING = 'Theo cách xem dân gian';

const LINKED_CHAPTER_TITLES: Readonly<Record<string, string>> = {
  [CHAPTER_MENH]: KHUNG_MENH.title,
  [CHAPTER_CONG_DANH]: KHUNG_CONG_DANH.title,
  [CHAPTER_TAI_BACH]: KHUNG_TAI_BACH.title,
  [CHAPTER_TINH_DUYEN]: KHUNG_TINH_DUYEN.title,
};

function namXem(year: VanHanYear): string {
  return `năm ${year.namCanChi} ${year.viewYear}`;
}

function linkedChapterLine(chapterOrder: string | null, linhVuc: string): string[] {
  const title = chapterOrder === null ? undefined : LINKED_CHAPTER_TITLES[chapterOrder];
  return title ? [`Muốn đọc kỹ hơn về ${linhVuc}, xem thêm chương “${title}”.`] : [];
}

export function renderLinhVucSection(year: VanHanYear): LuanGiaiSection {
  const linhVuc = LINH_VUC[year.cungTieuHan];
  const advice = year.tone === VanHanTone.LookBack ? linhVuc.nhinLai : linhVuc.loiKhuyen;

  return {
    slug: VanHanMucKey.LinhVuc,
    title: LINH_VUC_TITLE,
    sourceCung: `${year.cungTieuHan} · ${CHI[year.tieuHan]}`,
    paragraphs: [
      `Tiểu hạn ${namXem(year)} rơi vào cung ${year.cungTieuHan}, nên ${linhVuc.linhVuc} là ==lĩnh vực nổi bật nhất của năm==.`,
      advice,
      ...linkedChapterLine(linhVuc.chuongLienQuan, linhVuc.linhVuc),
    ],
  };
}

export function renderVanKeTiepSection(year: VanHanYear): LuanGiaiSection | null {
  const { daiVanKeTiep, cungDaiVanKeTiep, namBatDauVanKeTiep } = year;
  if (!daiVanKeTiep || !cungDaiVanKeTiep || namBatDauVanKeTiep === null) return null;

  return {
    slug: VanHanMucKey.VanKeTiep,
    title: VAN_KE_TIEP_TITLE,
    sourceCung: `${cungDaiVanKeTiep} · ${CHI[daiVanKeTiep.chiIndex]}`,
    paragraphs: [
      `Từ năm ${namBatDauVanKeTiep}, khi bạn ${daiVanKeTiep.startAge} tuổi âm, đại vận chuyển sang cung ${cungDaiVanKeTiep} và kéo dài tới ${daiVanKeTiep.endAge} tuổi.`,
      `Đó là ${DAI_VAN_CHU_DE[cungDaiVanKeTiep]}.`,
    ],
  };
}

function hanTuoiLines(chart: NatalChart, year: VanHanYear): string[] {
  const chiNamSinh = CHI[chart.pillars.year.chi];
  const isTamTaiYear = isTamTai(chart.pillars.year.chi, viewYearPillar(year.viewYear).chi);
  const isKimLauAge = isKimLau(year.tuoi);
  const clear = [...(isTamTaiYear ? [] : ['Tam Tai']), ...(isKimLauAge ? [] : ['Kim Lâu'])];

  return [
    ...(isTamTaiYear
      ? [`Năm ${year.namCanChi} nằm trong hạn Tam Tai của người tuổi ${chiNamSinh}. ${TAM_TAI_LOI}`]
      : []),
    ...(isKimLauAge ? [`Tuổi ${year.tuoi} âm phạm Kim Lâu. ${KIM_LAU_LOI}`] : []),
    ...(clear.length > 0 ? [`Năm này bạn không phạm ${clear.join(' hay ')}.`] : []),
  ];
}

export function renderDanGianSection(chart: NatalChart, year: VanHanYear): LuanGiaiSection {
  const sao = saoChieuMenh(year.tuoi, chart.gender);

  return {
    slug: VanHanMucKey.DanGian,
    title: DAN_GIAN_TITLE,
    sourceCung: `Tuổi ${CHI[chart.pillars.year.chi]}`,
    paragraphs: [
      `${DAN_GIAN_OPENING}, vốn khác với phép an sao tử vi ở trên, ${namXem(year)} bạn ${year.tuoi} tuổi âm và có sao ==${sao} chiếu mệnh==.`,
      CUU_DIEU_LOI[sao],
      ...hanTuoiLines(chart, year),
    ],
  };
}
