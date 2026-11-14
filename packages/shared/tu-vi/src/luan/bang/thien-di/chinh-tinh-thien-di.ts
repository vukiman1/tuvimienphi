import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_THIEN_DI: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['ra ngoài được kính nể, hay gặp người có thế lực sẵn lòng nâng đỡ', 'kính nể', 'nâng đỡ'],
    ['ra ngoài nặng thể diện, khó hạ mình làm quen với người lạ', 'nặng thể diện', 'khó hạ mình'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['hay đi lại, tới chỗ lạ là nhanh nhạy ứng biến theo hoàn cảnh', 'đi lại', 'ứng biến'],
    ['nay đây mai đó, chỗ ở và chỗ đi về ít khi cố định được lâu', 'nay đây mai đó', 'cố định'],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    ['ra ngoài cởi mở, dễ làm quen và hay đứng ra tiếp người', 'cởi mở', 'tiếp người'],
    [
      'ra ngoài tất bật, sức lực dành cho người khác nhiều hơn cho mình',
      'tất bật',
      'cho người khác',
    ],
    ['ra ngoài nổi bật, đi càng xa càng được nhiều người biết tiếng', 'nổi bật', 'biết tiếng'],
    [
      'ở bên ngoài vất vả lo toan mà ít người nhìn thấy công sức',
      'vất vả lo toan',
      'ít người nhìn thấy',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['xa quê lại có đất dụng võ, càng tự lập nơi xa càng vững', 'đất dụng võ', 'tự lập'],
    ['giao tiếp với người ngoài cứng cỏi, ít khi mềm mỏng xã giao', 'cứng cỏi', 'mềm mỏng'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['ra ngoài dễ hoà đồng, hay gặp người hiền và ít bị làm khó', 'hoà đồng', 'bị làm khó'],
    ['ra ngoài thiếu chủ động, quen chờ người khác sắp xếp giúp mình', 'thiếu chủ động', 'sắp xếp'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    [
      'giữ được mình giữa môi trường phức tạp, người ngoài nể vì thẳng thắn',
      'giữ được mình',
      'thẳng thắn',
    ],
    [
      'tới nơi lạ nên kỹ với thủ tục và quy định, sơ suất nhỏ cũng thành phiền',
      'thủ tục',
      'thành phiền',
    ],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['ra ngoài có chỗ dựa, gặp người rộng rãi và chu đáo', 'chỗ dựa', 'rộng rãi'],
    ['ngại rời chỗ quen nên chậm nắm lấy cơ hội ở xa', 'chỗ quen', 'cơ hội ở xa'],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    ['ra ngoài nhã nhặn, kín đáo nên dễ được người mới gặp quý mến', 'nhã nhặn', 'quý mến'],
    ['tới chỗ lạ phải mất một thời gian mới chịu mở lòng', 'chỗ lạ', 'mở lòng'],
    ['đi xa êm thuận, hay có người giúp đỡ một cách lặng lẽ', 'êm thuận', 'lặng lẽ'],
    ['xa nơi quen dễ thấy chông chênh, hay nhớ chốn cũ', 'chông chênh', 'chốn cũ'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['giao thiệp rộng, đi tới đâu cũng nhanh có người quen', 'giao thiệp rộng', 'người quen'],
    ['dễ mải mê những cuộc vui bên ngoài, quen nhiều mà ít người thật lòng', 'mải mê', 'thật lòng'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['ra ngoài nhờ lời ăn tiếng nói mà mở được đường', 'lời ăn tiếng nói', 'mở được đường'],
    ['ở nơi xa dễ vướng thị phi, lời mình nói dễ bị người lạ hiểu sai', 'thị phi', 'hiểu sai'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['được người ngoài tin cậy, hay được nhờ đứng ra làm trung gian', 'tin cậy', 'trung gian'],
    ['hay bị kéo vào việc của người khác nên việc riêng bị chậm', 'bị kéo vào', 'việc riêng'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['đi xa gặp người đi trước chỉ đường, có quý nhân đúng lúc', 'chỉ đường', 'quý nhân'],
    ['hay đứng ra lo chuyện bao đồng cho người ngoài rồi tự mình gánh', 'bao đồng', 'tự mình gánh'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['bôn ba mà vững, dám tới những nơi người khác còn ngại', 'bôn ba', 'dám tới'],
    ['đường xa nhiều vất vả, đi lại nên cẩn thận hơn người', 'đường xa', 'cẩn thận'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['rời nơi sinh ra lại dễ tìm được hướng đi của riêng mình', 'rời nơi sinh ra', 'hướng đi'],
    ['chỗ ở thay đổi nhiều, khó yên một nơi được lâu', 'thay đổi nhiều', 'yên một nơi'],
  ),
};
