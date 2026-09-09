import { TheChieu, type ThanCuBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';
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
export function checkPosition(brief: ThanCuBrief, bai: BaiCanKiem): string[] {
  const moiSao = [...brief.hungTinh, ...brief.catTinh];
  const chieuToi = moiSao.filter((sao) => sao.the !== TheChieu.ToaThu);
  // Cung vô chính diệu thì chính tinh trong brief là sao MƯỢN, không toạ thủ — chúng cũng phải bị
  // chặn nếu bài nói là đóng tại cung.
  const chinhTinhToaThu = brief.laVoChinhDieu ? [] : brief.chinhTinh.map((sao) => sao.ten);
  const toaThu = [
    ...chinhTinhToaThu,
    ...moiSao.filter((sao) => sao.the === TheChieu.ToaThu).map((sao) => sao.ten),
  ];

  return bai.doan.flatMap((doan, chiSo) =>
    sentences(doan).flatMap((cau) => {
      const thuong = cau.toLowerCase();
      if (!NGON_TU_TOA_THU.some((tu) => thuong.includes(tu))) return [];
      if (toaThu.some((ten) => thuong.includes(ten.toLowerCase()))) return [];

      const saoMuon = brief.laVoChinhDieu
        ? brief.chinhTinh
            .filter((sao) => thuong.includes(sao.ten.toLowerCase()))
            .map(
              (sao) =>
                `đoạn ${chiSo + 1}: "${sao.ten}" là sao mượn từ cung xung chiếu, không toạ thủ tại cung an Thân`,
            )
        : [];

      return [
        ...saoMuon,
        ...chieuToi
          .filter((sao) => thuong.includes(sao.ten.toLowerCase()))
          .map(
            (sao) =>
              `đoạn ${chiSo + 1}: "${sao.ten}" ở thế ${sao.the}, không đứng tại cung — đừng nói là toạ thủ hay đóng tại đây`,
          ),
      ];
    }),
  );
}
