import type { ChinhTinhName } from '../../../sao-names.js';
import { Sac, type LuanDe } from '../../luan-de.js';
import { cell, type CellLuan } from '../cell-luan.js';

const TRONG_THEO_BAC = 82;

function them(y: string, sao: ChinhTinhName, sac: Sac, ...tuKhoa: string[]): LuanDe {
  return { y, do: [sao], sac, trong: TRONG_THEO_BAC, tuKhoa };
}

/**
 * Chính tinh nhuộm vào cung Mệnh, luận về BẢN TÍNH và cách hành xử thường ngày — khác chương Thân
 * cư, chỗ đó luận đời người ngả về cung nào.
 *
 * Tra theo sao chứ không theo vị trí: một sao toạ thủ hay chiếu tới đều nhuộm cùng một nét, chỉ
 * khác đậm nhạt, và phần đậm nhạt đã nằm ở trọng số theo thế chiếu.
 *
 * Toàn bộ nội dung là bản nháp, CHƯA có người biết tử vi soát.
 */
export const CHINH_TINH_MENH: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['đứng ra gánh việc chung, người khác dễ trông vào', 'gánh việc chung', 'trông vào'],
    ['nặng thể diện, khó hạ mình nhận phần thiệt', 'thể diện', 'hạ mình'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['nghĩ nhanh, hay tính trước vài nước', 'nghĩ nhanh', 'tính trước'],
    ['tính nhiều hoá do dự, chậm chốt một đường', 'do dự', 'chậm chốt'],
  ),
  'Thái Dương': {
    ...cell(
      'Thái Dương',
      ['nhiệt tình, sẵn lòng lo phần việc của người khác', 'nhiệt tình', 'lo phần việc'],
      ['bộc trực, nói xong mới thấy mình lỡ lời', 'bộc trực', 'lỡ lời'],
    ),
    theoBac: {
      M: [
        them(
          'toả ra bên ngoài, ở đâu cũng dễ được để ý',
          'Thái Dương',
          Sac.Thuan,
          'toả ra',
          'được để ý',
        ),
      ],
      V: [
        them(
          'toả ra bên ngoài, ở đâu cũng dễ được để ý',
          'Thái Dương',
          Sac.Thuan,
          'toả ra',
          'được để ý',
        ),
      ],
      H: [
        them(
          'gắng sức nhiều mà công không về mình',
          'Thái Dương',
          Sac.Nghich,
          'gắng sức',
          'công không về mình',
        ),
      ],
    },
  },
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['dứt khoát, đã nhận việc là làm cho xong', 'dứt khoát', 'làm cho xong'],
    ['nói thẳng tới mức khô, dễ mất lòng người nghe', 'nói thẳng', 'mất lòng'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['dễ chịu, hoà được với người xung quanh', 'dễ chịu', 'hoà được'],
    ['ngại va chạm nên hay nhường phần khó cho qua chuyện', 'ngại va chạm', 'cho qua chuyện'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['giữ nguyên tắc, không xuê xoa cho xong việc', 'giữ nguyên tắc', 'xuê xoa'],
    ['tự ép mình quá mức, trong lòng ít khi thảnh thơi', 'tự ép mình', 'thảnh thơi'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['điềm đạm, biết lo xa và giữ được cái đang có', 'điềm đạm', 'lo xa'],
    ['thủ thế, chậm mở lòng với cái mới', 'thủ thế', 'cái mới'],
  ),
  'Thái Âm': {
    ...cell(
      'Thái Âm',
      ['ý tứ, để ý tới cảm giác của người bên cạnh', 'ý tứ', 'cảm giác'],
      ['giấu bụng, buồn vui ít khi nói ra', 'giấu bụng', 'ít khi nói ra'],
    ),
    theoBac: {
      H: [
        them(
          'hay chạnh lòng vì những chuyện nhỏ',
          'Thái Âm',
          Sac.Nghich,
          'chạnh lòng',
          'chuyện nhỏ',
        ),
      ],
    },
  },
  'Tham Lang': cell(
    'Tham Lang',
    ['hoạt, giao thiệp rộng và bắt cái mới rất nhanh', 'giao thiệp rộng', 'cái mới'],
    ['ham nhiều thứ cùng lúc nên hay bỏ dở giữa chừng', 'ham nhiều thứ', 'bỏ dở'],
  ),
  'Cự Môn': {
    ...cell(
      'Cự Môn',
      ['lý lẽ rõ ràng, nói có sức nặng', 'lý lẽ', 'sức nặng'],
      ['hay soi xét nên quanh mình lắm lời ra tiếng vào', 'soi xét', 'lời ra tiếng vào'],
    ),
    theoBac: {
      H: [
        them(
          'nghi trước tin sau, quan hệ khó bền lâu',
          'Cự Môn',
          Sac.Nghich,
          'nghi trước',
          'khó bền',
        ),
      ],
    },
  },
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['chỉn chu, giữ lời nên người ta yên tâm giao việc', 'chỉn chu', 'giữ lời'],
    ['quen làm theo khuôn, ít khi tự mở đường riêng', 'theo khuôn', 'tự mở đường'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['ngay thẳng, hay đứng ra nói giúp lẽ phải', 'ngay thẳng', 'lẽ phải'],
    ['ưa dạy bảo, dễ làm người khác thấy xa cách', 'dạy bảo', 'xa cách'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['quyết liệt, dám nhận phần việc khó', 'quyết liệt', 'việc khó'],
    ['nóng tính, ít nhịn nên hay va chạm', 'ít nhịn', 'va chạm'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['dám phá lệ, không ngại làm khác số đông', 'phá lệ', 'khác số đông'],
    ['đổi hướng liên tục, khó giữ mọi thứ ổn định', 'đổi hướng', 'ổn định'],
  ),
};
