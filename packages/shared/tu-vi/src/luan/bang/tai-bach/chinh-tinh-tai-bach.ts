import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_TAI_BACH: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['có cách kiếm tiền quy mô, hợp đứng ở vị trí cầm trùm nguồn thu', 'quy mô', 'cầm trùm'],
    [
      'nặng cách chi tiêu theo ý mình, khó san sẻ quyền quyết định tiền bạc cho người khác',
      'theo ý mình',
      'khó san sẻ',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    [
      'xoay vòng vốn nhanh nhạy, hợp kiếm tiền từ tính toán và nắm bắt thời cơ',
      'xoay vòng vốn',
      'nắm bắt thời cơ',
    ],
    ['đổi hướng làm ăn liên tục, khó giữ một nguồn thu ổn định lâu dài', 'đổi hướng', 'khó giữ'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    [
      'năng nổ kiếm tiền, hợp vai trò đứng mũi chịu sào cho cả nhà về tài chính',
      'năng nổ',
      'đứng mũi chịu sào',
    ],
    ['bỏ sức nhiều cho tiền bạc mà phần thu về chưa tương xứng', 'bỏ sức nhiều', 'chưa tương xứng'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    [
      'nhạy với tiền và số liệu, vốn là sao chủ tài nên dễ tích luỹ nếu biết giữ',
      'nhạy với tiền',
      'dễ tích luỹ',
    ],
    [
      'cứng trong cách giữ tiền, khó thoả hiệp khi chia hay góp vốn cùng người khác',
      'cứng trong cách giữ',
      'khó thoả hiệp',
    ],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['hoà nhã trong làm ăn, dễ hợp tác góp vốn với người khác', 'hoà nhã', 'hợp tác góp vốn'],
    [
      'ngại tranh phần lợi, thiếu một cú bứt phá để tiền bạc nhảy vọt',
      'ngại tranh phần lợi',
      'bứt phá',
    ],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['giữ tiền có nguyên tắc và kỷ luật, chi tiêu rõ ràng minh bạch', 'nguyên tắc', 'minh bạch'],
    [
      'khó xuê xoa trong chuyện tiền, dễ căng vì đòi hỏi sổ sách quá chặt',
      'khó xuê xoa',
      'quá chặt',
    ],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['ổn định, biết giữ của và tích luỹ dần theo năm tháng', 'ổn định', 'tích luỹ dần'],
    ['ngại mạo hiểm, chậm bắt lấy cơ hội sinh lời mới xuất hiện', 'ngại mạo hiểm', 'chậm bắt'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    [
      'chu đáo, tích luỹ kín kẽ và hợp vai trò giữ tay hòm chìa khoá',
      'chu đáo',
      'giữ tay hòm chìa khoá',
    ],
    [
      'ngại ra mặt đòi phần, công tích luỹ dễ bị nhìn thấy chậm hơn người khác',
      'ngại ra mặt',
      'chậm hơn người khác',
    ],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    [
      'đa năng, bắt cơ hội kiếm tiền nhanh và mở rộng nguồn thu tốt',
      'bắt cơ hội',
      'mở rộng nguồn thu',
    ],
    [
      'ham nhiều việc kiếm tiền cùng lúc nên khó dồn vốn theo một hướng',
      'ham nhiều việc',
      'khó dồn vốn',
    ],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    [
      'ăn nói có trọng lượng, hợp kiếm tiền từ việc cần tranh luận hay thương lượng',
      'có trọng lượng',
      'thương lượng',
    ],
    [
      'lời thẳng dễ va chạm, quanh chuyện tiền hay vướng thị phi không đáng có',
      'va chạm',
      'thị phi',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['chỉn chu nên được giao giữ tiền hay quản vốn cho người khác', 'chỉn chu', 'quản vốn'],
    ['quen theo khuôn có sẵn, ngại tự đề xuất một hướng kiếm tiền mới', 'theo khuôn', 'đề xuất'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    [
      'được tin tưởng giao vai trò gỡ khó tài chính hoặc làm người cố vấn tiền bạc',
      'gỡ khó tài chính',
      'cố vấn',
    ],
    [
      'hay đứng ra gánh nợ hay chi tiêu thay người khác, nhận thêm phần không phải của mình',
      'thay người khác',
      'không phải của mình',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['xông xáo, dám lao vào việc kiếm tiền khó mà không ngần ngại', 'xông xáo', 'không ngần ngại'],
    [
      'nóng vội trong quyết định tiền bạc, dễ đưa ra lựa chọn thiếu kiên nhẫn',
      'nóng vội',
      'thiếu kiên nhẫn',
    ],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    [
      'dám đổi mới cách kiếm tiền, không ngại thử hướng làm ăn khác lối cũ',
      'dám đổi mới',
      'khác lối cũ',
    ],
    ['đổi hướng làm ăn liên tục khiến tiền bạc khó ổn định lâu dài', 'đổi hướng', 'khó ổn định'],
  ),
};
