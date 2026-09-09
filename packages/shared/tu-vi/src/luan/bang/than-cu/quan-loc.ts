import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

/**
 * Thân cư Quan Lộc: đời lấy công việc làm trục. Mệnh đề ở đây nói về CÁCH LÀM VIỆC và chỗ đứng nghề
 * nghiệp, không nói về tiền hay quan hệ riêng.
 */
export const THAN_CU_QUAN_LOC: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['hợp chỗ đứng đầu, nói ra thì người khác dễ nghe theo', 'đứng đầu', 'nghe theo'],
    ['khó ở lâu dưới trướng người mình không phục', 'dưới trướng', 'không phục'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['hợp việc cần tính toán, bày kế, tham mưu', 'tính toán', 'tham mưu'],
    ['đổi việc nhiều, khó ở một chỗ đủ lâu để chín', 'đổi việc', 'đủ lâu'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    ['hợp việc phải xuất hiện, nói trước nhiều người', 'xuất hiện', 'trước nhiều người'],
    ['hay gánh cả phần việc của người khác', 'gánh cả phần việc', 'người khác'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['hợp việc dính tiền nong, cần kỷ luật và con số', 'tiền nong', 'kỷ luật'],
    ['cách làm cứng, khó uyển chuyển khi việc đổi', 'cách làm cứng', 'uyển chuyển'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['hợp môi trường ôn hoà, làm việc không tranh giành', 'ôn hoà', 'không tranh giành'],
    ['ít tham vọng nên đường thăng tiến đi chậm', 'tham vọng', 'thăng tiến'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['làm có kỷ cương, chịu được việc khó và việc lâu', 'kỷ cương', 'việc khó'],
    ['giữ nguyên tắc nên dễ va chạm với người cùng làm', 'nguyên tắc', 'va chạm'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['giữ được việc lâu dài, hay được giao coi của', 'lâu dài', 'coi của'],
    ['thủ thế, ít khi dám đánh liều lúc cần bứt lên', 'thủ thế', 'đánh liều'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['hợp việc tỉ mỉ, làm phía sau mà chắc', 'tỉ mỉ', 'phía sau'],
    ['ngại đứng ra tranh nên công dễ bị người khác nhận', 'ngại đứng ra', 'bị người khác nhận'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['giỏi giao tế, mở được quan hệ cho công việc', 'giao tế', 'mở được quan hệ'],
    ['ôm nhiều việc cùng lúc nên khó tinh một nghề', 'ôm nhiều việc', 'tinh một nghề'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['hợp nghề dùng lời: dạy học, tư vấn, tranh biện', 'dùng lời', 'tranh biện'],
    ['dễ mất lòng người cùng làm cũng vì lời nói', 'mất lòng', 'lời nói'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['được tin giao việc, làm người phó rất vững', 'được tin giao việc', 'người phó'],
    ['phụ thuộc vào người đứng đầu, người đó đổi thì mình lung lay', 'phụ thuộc', 'lung lay'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['được kính nể, hợp việc giám sát và cố vấn', 'kính nể', 'cố vấn'],
    ['hay phải đi dọn phần việc dở dang của người khác', 'dọn phần việc', 'dở dang'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['mở đường được, chịu được áp lực lớn mà không nao', 'mở đường', 'áp lực lớn'],
    ['khó hợp tác nên phần lớn đường nghề tự đi một mình', 'khó hợp tác', 'tự đi'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['hợp việc dựng lại từ đầu, chỗ nào hỏng thì làm mới', 'dựng lại từ đầu', 'làm mới'],
    ['nghề nghiệp đổi hướng nhiều lần, khó đi một mạch', 'đổi hướng', 'một mạch'],
  ),
};
