import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_QUAN_LOC: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    [
      'thường được đẩy lên vai cầm đầu, người khác quen nhìn vào mình mà quyết',
      'cầm đầu',
      'nhìn vào mình',
    ],
    [
      'nặng quyền, khó san việc hay nhường phần quyết định cho người khác',
      'nặng quyền',
      'nhường phần',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['xoay việc nhanh, hợp vai trò tính toán và lên phương án', 'xoay việc', 'lên phương án'],
    ['đổi hướng liên tục, khó theo một con đường cho tới cùng', 'đổi hướng', 'tới cùng'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    ['năng nổ, hay nhận phần đối ngoại hoặc đại diện cho cả nhóm', 'năng nổ', 'đại diện'],
    [
      'gắng sức nhiều cho công việc mà phần công nhận không tương xứng',
      'gắng sức',
      'không tương xứng',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['quyết đoán, giỏi xử lý việc liên quan tới tiền và số liệu', 'quyết đoán', 'tiền và số liệu'],
    ['cứng nhắc, khó thoả hiệp khi làm chung với người khác', 'cứng nhắc', 'khó thoả hiệp'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['hoà nhã nơi làm việc, dễ bắt tay hợp tác với đồng nghiệp', 'hoà nhã', 'hợp tác'],
    ['ngại tranh phần, thiếu hẳn một cú bứt phá để tiến xa hơn', 'ngại tranh phần', 'bứt phá'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['giữ nguyên tắc và kỷ luật, việc giao cho là yên tâm', 'nguyên tắc', 'yên tâm'],
    ['khó xuê xoa với đồng nghiệp, dễ căng vì đòi hỏi quá chặt', 'khó xuê xoa', 'căng'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    [
      'ổn định, biết giữ vị trí và tích lại kinh nghiệm theo năm tháng',
      'ổn định',
      'tích lại kinh nghiệm',
    ],
    ['ngại đổi việc, chậm bắt lấy cơ hội mới khi nó vừa xuất hiện', 'ngại đổi việc', 'chậm bắt'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['chu đáo, làm việc kỹ càng và hợp vai trò đứng sau hậu trường', 'chu đáo', 'hậu trường'],
    [
      'ngại xung phong, công sức bỏ ra dễ bị nhìn thấy chậm hơn người khác',
      'ngại xung phong',
      'chậm hơn người khác',
    ],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    [
      'đa năng, bắt cơ hội nhanh và mở rộng quan hệ làm việc tốt',
      'bắt cơ hội nhanh',
      'mở rộng quan hệ',
    ],
    [
      'ham làm nhiều việc cùng lúc nên khó theo tới cùng một hướng',
      'ham nhiều việc',
      'khó theo tới cùng',
    ],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    [
      'ăn nói có trọng lượng, hợp việc cần tranh luận hoặc thuyết trình',
      'có trọng lượng',
      'thuyết trình',
    ],
    ['lời thẳng dễ va chạm, quanh việc hay vướng thị phi không đáng có', 'va chạm', 'thị phi'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['chỉn chu nên được giao những việc cần sự tin tưởng', 'chỉn chu', 'tin tưởng'],
    ['quen làm theo khuôn có sẵn, ngại tự đề xuất một hướng mới', 'theo khuôn', 'đề xuất'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['được tin tưởng giao vai trò gỡ việc khó hoặc làm người cố vấn', 'gỡ việc khó', 'cố vấn'],
    [
      'hay ôm việc thay người khác, nhận thêm cả phần không phải của mình',
      'ôm việc thay người khác',
      'không phải của mình',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['xông xáo, nhận việc khó mà không ngần ngại', 'xông xáo', 'không ngần ngại'],
    ['nóng vội, dễ va chạm với người cùng làm vì thiếu kiên nhẫn', 'nóng vội', 'thiếu kiên nhẫn'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['dám đổi mới, không ngại làm khác lối cũ để tìm đường riêng', 'dám đổi mới', 'đường riêng'],
    ['đổi hướng liên tục khiến công việc khó ổn định lâu dài', 'đổi hướng liên tục', 'khó ổn định'],
  ),
};
