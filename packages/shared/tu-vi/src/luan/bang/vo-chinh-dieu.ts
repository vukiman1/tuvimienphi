import { Sac, type LuanDe } from '../luan-de.js';

/**
 * Cung an Thân vô chính diệu: không chính tinh nào toạ thủ nên cung trống, phải mượn chính tinh từ
 * cung xung chiếu. Hai mệnh đề dưới đây nói về chính cái TRỐNG đó — nó là nét luận riêng, không
 * phải chuyện của sao mượn.
 *
 * Bản nháp, chưa có người biết tử vi soát, như mọi bảng khác.
 */
export const VO_CHINH_DIEU: readonly LuanDe[] = [
  {
    y: 'không bị một khuôn nào đóng sẵn nên dễ thích nghi, hoàn cảnh đổi thì mình đổi theo được',
    do: [],
    sac: Sac.Thuan,
    trong: 80,
    tuKhoa: ['thích nghi', 'đổi theo'],
  },
  {
    y: 'thiếu chủ kiến ở phần này, dễ bị người và hoàn cảnh bên ngoài dẫn đi',
    do: [],
    sac: Sac.Nghich,
    trong: 76,
    tuKhoa: ['chủ kiến', 'dẫn đi'],
  },
];

/** Sao mượn tác động nhẹ hơn sao toạ thủ thật: nó đứng ở cung khác, chỉ chiếu sang. */
export const MUON_FACTOR = 0.7;
