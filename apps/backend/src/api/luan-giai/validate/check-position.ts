import { TheChieu, type ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { sentences } from './parse-markup';

/** Cách nói khẳng định sao ĐỨNG TẠI cung. Chỉ đúng với sao toạ thủ. */
const NGON_TU_TOA_THU = [
  'toạ thủ',
  'tọa thủ',
  'đóng tại đây',
  'đóng ở đây',
  'đóng tại cung',
  'nằm tại cung',
  'thủ tại cung',
] as const;

/**
 * Tầng năm: nói đúng vị trí sao.
 *
 * Sao tam hợp, xung chiếu hay nhị hợp KHÔNG đứng ở cung đang xét — chúng chiếu tới. Viết "Thiên Y
 * toạ thủ" cho một sao thực ra nằm ở cung xung chiếu là sai vị trí, mà đọc lên vẫn trôi hệt như
 * chuyện "thủ mệnh" ở tầng bốn.
 *
 * Chỉ báo lỗi khi trong câu KHÔNG có sao toạ thủ nào: một câu vừa nhắc sao toạ thủ vừa nhắc sao
 * chiếu tới thì không biết cách nói đó gắn vào sao nào, và đoán bừa sẽ tạo báo động giả.
 */
export function checkPosition(brief: ThanCuBrief, paragraphs: ThanCuParagraphs): string[] {
  const moiSao = [...brief.hungTinh, ...brief.catTinh];
  const chieuToi = moiSao.filter((sao) => sao.the !== TheChieu.ToaThu);
  const toaThu = [
    ...brief.chinhTinh.map((sao) => sao.ten),
    ...moiSao.filter((sao) => sao.the === TheChieu.ToaThu).map((sao) => sao.ten),
  ];

  return [paragraphs.doan1, paragraphs.doan2].flatMap((doan, chiSo) =>
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
