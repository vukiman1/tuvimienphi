import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_TU_TUC: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    [
      'khi có con, con mang khí chất đàng hoàng và sớm có chí lớn',
      'khí chất đàng hoàng',
      'chí lớn',
    ],
    ['con có lòng tự tôn cao, muốn con nghe thì phải biết lựa lời', 'tự tôn', 'lựa lời'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['con sáng dạ, nhanh hiểu và biết quan sát', 'sáng dạ', 'biết quan sát'],
    [
      'nếu có con, con lắm suy nghĩ, hay đổi ý, cần được kiên nhẫn theo sát',
      'hay đổi ý',
      'kiên nhẫn theo sát',
    ],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    ['con thẳng tính, có gì cũng muốn nói ra cho minh bạch', 'thẳng tính', 'cho minh bạch'],
    [
      'lúc có con, con hướng ra bên ngoài nhiều, ít dịp quây quần bên mình',
      'hướng ra bên ngoài',
      'ít dịp quây quần',
    ],
    ['con sáng sủa, hào hiệp, sống rộng rãi với mọi người', 'sáng sủa', 'hào hiệp'],
    [
      'con hay tự ái, gắng sức nhiều mà dễ thấy mình chưa được ghi nhận',
      'hay tự ái',
      'chưa được ghi nhận',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['con cứng cỏi, tự lực, sớm biết lo cho bản thân', 'tự lực', 'lo cho bản thân'],
    [
      'khi có con, giữa mình và con dễ thiếu những lời tình cảm, thương mà khó bày tỏ',
      'lời tình cảm',
      'khó bày tỏ',
    ],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    [
      'nếu có con, con tính tình hiền hoà, dễ gần gũi, ở cạnh thấy nhẹ lòng',
      'hiền hoà',
      'nhẹ lòng',
    ],
    ['con ưa thong thả, việc gì chưa thích thì hay chần chừ', 'ưa thong thả', 'chần chừ'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['con có khí khái, sống ngay thẳng, biết giữ chữ tín', 'khí khái', 'ngay thẳng'],
    [
      'lúc có con, hai bên dễ căng thẳng vì tính bướng, ai cũng muốn giữ ý mình',
      'tính bướng',
      'giữ ý mình',
    ],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['con điềm tĩnh, biết điều, có nét phúc hậu', 'điềm tĩnh', 'phúc hậu'],
    [
      'khi có con, con thận trọng, ưa nếp cũ, gặp lựa chọn mới hay ngần ngừ lâu',
      'ưa nếp cũ',
      'ngần ngừ',
    ],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    ['con quấn nhà, quý những phút riêng bên người thân', 'quấn nhà', 'phút riêng'],
    [
      'con nhạy cảm, hay giữ buồn trong lòng, cần được lắng nghe nhiều',
      'hay giữ buồn',
      'được lắng nghe',
    ],
    ['tình thân giữa mình và con sâu nặng, con dịu dàng và biết quan tâm', 'sâu nặng', 'dịu dàng'],
    ['con khép kín, có điều tủi thì để riêng mình biết', 'khép kín', 'để riêng mình biết'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    [
      'nếu có con, con lanh lợi, nhiều tài vặt, giỏi giao thiệp',
      'nhiều tài vặt',
      'giỏi giao thiệp',
    ],
    ['con ham vui, mải chơi, cần được định hướng sớm', 'ham vui', 'định hướng sớm'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['con ăn nói có lý lẽ, ham học hỏi và thích tranh luận', 'có lý lẽ', 'ham học hỏi'],
    [
      'khi có con, hai bên dễ bất đồng qua lời ăn tiếng nói, nói chưa khéo là thành xa cách',
      'bất đồng qua lời',
      'thành xa cách',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['con tốt bụng, có lòng bênh vực người yếu thế', 'tốt bụng', 'bênh vực'],
    [
      'lúc có con, con dễ nghe theo bạn bè hơn là lời người nhà',
      'nghe theo bạn bè',
      'lời người nhà',
    ],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['con hiền lành, hiếu nghĩa, biết nghĩ cho người thân', 'hiếu nghĩa', 'nghĩ cho người thân'],
    ['nếu có con, con sớm già dặn, hay lo xa và ít khi chịu thả lỏng', 'già dặn', 'thả lỏng'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['con gan dạ, dám đương đầu với khó khăn', 'gan dạ', 'dám đương đầu'],
    [
      'khi có con, con mang cá tính mạnh, bị ép là phản ứng nên việc dạy dỗ khá tốn công',
      'cá tính mạnh',
      'tốn công',
    ],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['con mạnh dạn, thích cái mới, dám làm khác người', 'mạnh dạn', 'làm khác người'],
    [
      'lúc có con, con hiếu động và ít chịu khuôn phép, nếp nhà vì thế hay phải đổi theo',
      'hiếu động',
      'khuôn phép',
    ],
  ),
};
