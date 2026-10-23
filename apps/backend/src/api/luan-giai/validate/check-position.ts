import { TheChieu, type ChapterBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';
import { sentences } from './parse-markup';

const NGON_TU_TOA_THU = [
  'toạ thủ',
  'tọa thủ',
  'đóng tại đây',
  'đóng ở đây',
  'đóng tại cung',
  'nằm tại cung',
  'thủ tại cung',
] as const;

export function checkPosition(brief: ChapterBrief, bai: BaiCanKiem): string[] {
  const moiSao = [...brief.chinhTinh, ...brief.hungTinh, ...brief.catTinh];
  const chieuToi = moiSao.filter((sao) => sao.the !== TheChieu.ToaThu);
  const toaThu = moiSao.filter((sao) => sao.the === TheChieu.ToaThu).map((sao) => sao.ten);

  return bai.doan.flatMap((doan, chiSo) =>
    sentences(doan).flatMap((cau) => {
      const thuong = cau.toLowerCase();
      if (!NGON_TU_TOA_THU.some((tu) => thuong.includes(tu))) return [];
      if (toaThu.some((ten) => thuong.includes(ten.toLowerCase()))) return [];

      return chieuToi
        .filter((sao) => thuong.includes(sao.ten.toLowerCase()))
        .map(
          (sao) =>
            `đoạn ${chiSo + 1}: "${sao.ten}" ở thế ${sao.the}, không đứng tại cung — đừng nói là toạ thủ hay đóng tại đây`,
        );
    }),
  );
}
