import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

/**
 * Thân cư Tài Bạch: đời ngả về tiền tài và cảm giác an toàn vật chất. Mệnh đề ở đây nói về CÁCH
 * TIỀN VÀO RA, không nói về nghề nghiệp hay tính cách.
 */
export const THAN_CU_TAI_BACH: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['tiền vào theo vị thế và chức phận, càng có chỗ đứng càng dư', 'vị thế', 'chỗ đứng'],
    ['tiêu theo thể diện nên khó dành lại được nhiều', 'thể diện', 'khó dành'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['kiếm bằng đầu óc, xoay được nhiều nguồn cùng lúc', 'đầu óc', 'nhiều nguồn'],
    ['nguồn thu lên xuống thất thường, khó tính trước', 'lên xuống', 'khó tính trước'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    ['kiếm được và cũng sẵn lòng cho đi', 'kiếm được', 'cho đi'],
    ['tiền qua tay nhiều mà giữ lại được ít', 'qua tay', 'giữ lại'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['giỏi tính toán tiền nong và giữ được đồng tiền', 'tính toán', 'giữ được'],
    ['nặng về vật chất nên nhiều khi đo mọi thứ bằng tiền', 'nặng về vật chất', 'đo bằng tiền'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['đủ ăn đủ tiêu, ít khi rơi vào cảnh túng', 'đủ ăn đủ tiêu', 'túng'],
    ['không cố nên cũng ít khi dư ra đáng kể', 'không cố', 'dư ra'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['kiếm tiền có nguyên tắc, không làm chuyện khuất tất', 'nguyên tắc', 'khuất tất'],
    ['cứng nên hay bỏ lỡ những cơ hội đến nhanh', 'bỏ lỡ', 'đến nhanh'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['có kho, biết tích, càng về sau càng dư dả', 'biết tích', 'về sau'],
    ['giữ chặt quá nên đồng tiền chậm sinh lời', 'giữ chặt', 'sinh lời'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['tiền từ tích góp đều đặn, hợp nhà cửa đất đai', 'tích góp', 'nhà cửa đất đai'],
    ['lo chuyện thiếu hụt ngay cả lúc đang đủ', 'thiếu hụt', 'đang đủ'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['nhiều nguồn thu, kiếm được nhanh khi có cơ', 'nhiều nguồn thu', 'kiếm được nhanh'],
    ['tiêu cũng nhanh theo sở thích nên khó tích', 'tiêu cũng nhanh', 'sở thích'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['kiếm bằng lời nói và tài thương lượng', 'lời nói', 'thương lượng'],
    ['hay vướng tranh chấp quanh chuyện tiền bạc', 'tranh chấp', 'tiền bạc'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['tiền vào đều, hay được người khác tin giao giữ của', 'tiền vào đều', 'giao giữ của'],
    ['chi nhiều cho thể diện và cho người quen', 'chi nhiều', 'người quen'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['lúc túng thường có người giúp, ít khi bí đường', 'có người giúp', 'bí đường'],
    ['không mặn mà chuyện làm giàu nên tiền chỉ đủ dùng', 'không mặn mà', 'đủ dùng'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['kiếm được món lớn khi dám nhận phần rủi ro', 'món lớn', 'rủi ro'],
    ['vào ra đều mạnh, hiếm khi bằng phẳng', 'vào ra', 'bằng phẳng'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['phá đi rồi lập lại được, tiền đi theo từng chu kỳ', 'lập lại', 'chu kỳ'],
    ['hao nhiều nên khó tích liền một mạch', 'hao nhiều', 'liền một mạch'],
  ),
};
