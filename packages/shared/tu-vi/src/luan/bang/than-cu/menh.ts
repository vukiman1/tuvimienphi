import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

/**
 * Thân cư Mệnh: Thân trùng cung Mệnh, nên đời người ngả về chính bản thân họ chứ không ngả về một
 * cung nào khác. Mệnh đề ở đây nói về TÍNH CÁCH và cách sống, không nói về quan hệ hay của cải.
 */
export const THAN_CU_MENH: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['tự trọng cao, muốn tự tay định đoạt đường đi của mình', 'tự trọng', 'tự tay định đoạt'],
    ['khó chịu khi phải đứng dưới người khác, dễ thành lẻ loi', 'đứng dưới', 'lẻ loi'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['đầu óc nhanh, giỏi xoay chuyển khi hoàn cảnh đổi', 'đầu óc nhanh', 'xoay chuyển'],
    ['hay đổi ý, khó ngồi yên với một lựa chọn đủ lâu', 'đổi ý', 'ngồi yên'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    ['sống thẳng, có gì nói nấy, toả ra bên ngoài', 'sống thẳng', 'toả ra'],
    ['lo cho người khác tới mức quên phần mình', 'lo cho người khác', 'quên phần mình'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['quyết đoán, đã định là làm tới', 'quyết đoán', 'làm tới'],
    ['khô khan, ít nói lời mềm nên hay bị hiểu là lạnh', 'khô khan', 'lời mềm'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['tính hiền hoà, biết vui với cái mình đang có', 'hiền hoà', 'đang có'],
    ['thiếu quyết liệt, gặp việc khó dễ buông cho qua', 'quyết liệt', 'buông'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['có nguyên tắc riêng rất chặt và giữ được nó', 'nguyên tắc riêng', 'giữ được'],
    ['cứng quá nên nhiều khi tự làm khó chính mình', 'cứng', 'tự làm khó'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['vững vàng, biết tích luỹ và giữ được cái đã có', 'vững vàng', 'tích luỹ'],
    ['giữ mình kỹ quá nên chậm bung ra khi thời tới', 'giữ mình', 'chậm bung ra'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['tinh tế, đọc được ý người khác mà không cần nói ra', 'tinh tế', 'đọc được ý'],
    ['nghĩ ngợi nhiều, hay tự làm mình mệt vì chuyện chưa xảy ra', 'nghĩ ngợi', 'tự làm mình mệt'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['nhiều hứng thú, học gì cũng bắt nhịp nhanh', 'hứng thú', 'bắt nhịp nhanh'],
    ['ôm nhiều thứ cùng lúc nên khó đi sâu tới cùng', 'ôm nhiều thứ', 'đi sâu'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['ăn nói sắc, hay hỏi tới nơi tới chốn', 'ăn nói sắc', 'hỏi tới nơi'],
    ['dễ vướng thị phi cũng vì chính lời mình nói', 'thị phi', 'lời mình nói'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['đứng đắn, giữ chữ tín nên được người ta tin cậy', 'đứng đắn', 'tin cậy'],
    ['quen có chỗ dựa nên khi phải tự đứng thì lúng túng', 'chỗ dựa', 'tự đứng'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['chững chạc sớm, hay đứng ra che chở cho người khác', 'chững chạc', 'che chở'],
    ['cô cao, giữ khoảng cách nên ít ai thật sự thân', 'cô cao', 'khoảng cách'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['độc lập, dám một mình đi con đường mình chọn', 'độc lập', 'một mình'],
    ['ít người theo kịp nên đường đi thường đơn độc', 'theo kịp', 'đơn độc'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['dám bỏ cái cũ để làm lại từ đầu', 'bỏ cái cũ', 'làm lại'],
    ['đời nhiều khúc gãy, khó giữ mọi thứ nguyên như cũ', 'khúc gãy', 'nguyên như cũ'],
  ),
};
