import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

/**
 * Thân cư Thiên Di: đời ngả ra bên ngoài — môi trường sống, chuyện đi xa, người gặp trên đường.
 * Mệnh đề ở đây nói về chuyện RA NGOÀI, không nói về bản thân hay gia đạo.
 */
export const THAN_CU_THIEN_DI: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['ra ngoài được nể trọng, dễ có chỗ đứng nơi mới', 'nể trọng', 'chỗ đứng'],
    ['khó chịu ở nơi không ai biết mình là ai', 'không ai biết', 'khó chịu'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['hợp di chuyển, đổi chỗ thì lại mở ra cơ hội', 'di chuyển', 'mở ra cơ hội'],
    ['chỗ ở chỗ làm ít khi cố định được lâu', 'cố định', 'lâu'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    ['ra ngoài dễ nổi, người ta nhớ mặt nhớ tên', 'dễ nổi', 'nhớ mặt'],
    ['lo việc bên ngoài nhiều hơn việc trong nhà', 'việc bên ngoài', 'trong nhà'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['đi xa làm ăn được, càng xa càng có đất dụng', 'đi xa', 'đất dụng'],
    ['quan hệ ngoài chỉ dừng ở xã giao, ít khi thân', 'xã giao', 'ít khi thân'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['đi đâu cũng dễ được quý, ít khi bị làm khó', 'dễ được quý', 'bị làm khó'],
    ['thiếu chủ động nên hay đi theo sắp xếp của người khác', 'thiếu chủ động', 'sắp xếp'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['giữ được mình ngay ở môi trường phức tạp', 'giữ được mình', 'phức tạp'],
    ['dễ va chạm ở chỗ đông người vì không chịu xuôi theo', 'va chạm', 'xuôi theo'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['ra ngoài vẫn có chỗ dựa, đi đâu cũng được nhờ', 'chỗ dựa', 'được nhờ'],
    ['ngại rời chỗ quen nên chậm nắm cơ hội ở xa', 'chỗ quen', 'cơ hội ở xa'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['hợp môi trường êm, hay có người đỡ một cách kín đáo', 'môi trường êm', 'kín đáo'],
    ['tới chỗ lạ thì khó bung, phải mất thời gian mới quen', 'chỗ lạ', 'mất thời gian'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['giao tế rộng, đi đâu cũng nhanh có người quen', 'giao tế rộng', 'người quen'],
    ['quan hệ rộng mà nông, lúc cần thì ít người thật lòng', 'rộng mà nông', 'thật lòng'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['ra ngoài dùng miệng lưỡi mà nên việc', 'miệng lưỡi', 'nên việc'],
    ['dễ mắc thị phi ở nơi xa, chuyện bé xé ra to', 'thị phi', 'chuyện bé'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['được người ngoài tin, hay được nhờ làm trung gian', 'được người ngoài tin', 'trung gian'],
    ['bận vì việc người khác nhờ nên việc mình bị chậm', 'người khác nhờ', 'bị chậm'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['đi xa gặp quý nhân, thường có người chỉ đường đúng lúc', 'quý nhân', 'chỉ đường'],
    ['dễ thành chỗ dựa của người khác rồi tự mình gánh', 'chỗ dựa', 'tự mình gánh'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['bôn ba mà nên, càng gặp việc khó càng vững tay', 'bôn ba', 'việc khó'],
    ['đường đi ít bạn đồng hành, phần lớn phải tự lo', 'bạn đồng hành', 'tự lo'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['rời nơi sinh ra mà lập được nghiệp riêng', 'rời nơi sinh ra', 'nghiệp riêng'],
    ['nơi ở nơi làm thay đổi nhiều, khó an cư sớm', 'thay đổi nhiều', 'an cư'],
  ),
};
