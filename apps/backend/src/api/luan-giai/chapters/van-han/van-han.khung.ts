import { DAI_VAN_CHU_DE, LINH_VUC, VanHanTone, type VanHanYear } from '@org/shared-tu-vi';
import type { KhungChuong } from '../../article/khung-chuong';

const EYEBROW = 'Vận hạn';
const CLOSING_LABEL = 'Một lời dành cho bạn';

interface KhungTheoGiong {
  readonly summary: string;
  readonly closing: string;
}

const KHUNG_THEO_GIONG: Readonly<Record<VanHanTone, KhungTheoGiong>> = {
  [VanHanTone.Advice]: {
    summary:
      'Một năm thuận hay nghịch **không quyết định thay bạn**: cùng một vận, người biết lúc nào nên tiến, lúc nào nên giữ sẽ đi qua nhẹ hơn. Điều đáng làm là ==dồn sức vào điểm sáng, giữ kỹ chỗ dễ vướng==.',
    closing: 'Biết trước nhịp năm không phải để lo, mà để chọn đúng lúc dồn sức.',
  },
  [VanHanTone.LookBack]: {
    summary:
      'Nhìn lại một năm đã qua **không phải để tiếc hay trách**, mà để thấy vận đã đi theo nhịp nào. Điều đáng giữ lại là ==hiểu nhịp vận của chính mình== để bước vào những năm sau vững hơn.',
    closing: 'Năm đã qua là bài học, không phải gánh nặng.',
  },
};

function moBai(year: VanHanYear): string {
  const khiAy = year.tone === VanHanTone.LookBack ? 'khi ấy ' : '';
  return `Năm ${year.namCanChi} ${year.viewYear} bạn ${year.tuoi} tuổi âm, ${khiAy}đang đi **đại vận ${year.daiVan.startAge}–${year.daiVan.endAge} tuổi** ở cung ${year.cungDaiVan}, ${DAI_VAN_CHU_DE[year.cungDaiVan]}. Đây là năm thứ ${year.namThuTrongVan} trong mười năm ấy, và tiểu hạn của năm đi qua cung ${year.cungTieuHan}.`;
}

export function khungVanHan(year: VanHanYear): KhungChuong {
  return {
    eyebrow: EYEBROW,
    title: `Vận hạn năm ${year.namCanChi} ${year.viewYear}`,
    closingLabel: CLOSING_LABEL,
    quote: LINH_VUC[year.cungTieuHan].chuDeNam,
    moBai: moBai(year),
    ...KHUNG_THEO_GIONG[year.tone],
  };
}
