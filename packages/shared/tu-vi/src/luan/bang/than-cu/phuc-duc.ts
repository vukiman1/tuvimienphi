import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, type CellLuan } from '../cell-luan.js';

/**
 * Thân cư Phúc Đức: đời ngả về phần tinh thần, phúc phần tích luỹ và nếp nhà. Mệnh đề ở đây nói về
 * chuyện AN hay KHÔNG AN trong lòng, không nói về sự nghiệp hay tiền bạc.
 */
export const THAN_CU_PHUC_DUC: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['coi trọng danh dự và nếp nhà, sống có chuẩn mực riêng', 'danh dự', 'chuẩn mực'],
    ['tự đặt chuẩn quá cao nên khó bằng lòng với hiện tại', 'chuẩn quá cao', 'bằng lòng'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['hay ngẫm nghĩ, tìm được cái thú trong chuyện suy xét', 'ngẫm nghĩ', 'suy xét'],
    ['lo xa quá mức nên đầu ít khi thật sự nghỉ', 'lo xa', 'ít khi thật sự nghỉ'],
  ),
  'Thái Dương': cell(
    'Thái Dương',
    ['thích cho đi, thấy vui khi giúp được người khác', 'cho đi', 'giúp được'],
    ['cho nhiều mà nhận lại ít nên có lúc thấy hụt', 'nhận lại ít', 'thấy hụt'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['yên tâm khi có nền vật chất vững dưới chân', 'nền vật chất', 'yên tâm'],
    ['khó thư giãn, lúc nghỉ đầu vẫn tính chuyện chưa xong', 'thư giãn', 'vẫn tính'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['dễ vui, biết đủ nên trong lòng thường nhẹ nhõm', 'biết đủ', 'nhẹ nhõm'],
    ['an nhàn quen rồi thì thiếu động lực bước tiếp', 'an nhàn', 'động lực'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['sống theo khuôn mình đặt ra và giữ được nó lâu dài', 'khuôn mình đặt ra', 'giữ được'],
    ['tự trói vào nguyên tắc nên hiếm khi thật sự thảnh thơi', 'tự trói', 'thảnh thơi'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['nếp nhà ổn định, có phần để dành cho lúc cần', 'nếp nhà', 'để dành'],
    ['ngại thay đổi, thích mọi thứ cứ yên như cũ', 'ngại thay đổi', 'yên như cũ'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['đời sống bên trong phong phú, cảm nhận sâu', 'bên trong', 'cảm nhận sâu'],
    ['nhạy cảm nên dễ chạnh lòng vì chuyện người khác bỏ qua', 'nhạy cảm', 'chạnh lòng'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['biết hưởng, có thú riêng và sống không tẻ nhạt', 'biết hưởng', 'thú riêng'],
    ['ham nhiều thứ nên phúc phần dễ tiêu tán theo', 'ham nhiều thứ', 'tiêu tán'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['thích tìm hiểu tới gốc, không tin theo lời đồn', 'tìm hiểu tới gốc', 'lời đồn'],
    ['nghi ngờ nhiều nên trong lòng khó thật sự yên', 'nghi ngờ', 'khó thật sự yên'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['sống có trước có sau nên được người xung quanh quý', 'trước có sau', 'được quý'],
    ['bận tâm chuyện thể diện nên nhiều khi tự làm khổ', 'thể diện', 'tự làm khổ'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['có phúc ấm, gặp việc thường có người đỡ đúng lúc', 'phúc ấm', 'người đỡ'],
    ['hay gánh chuyện thiên hạ nên phần mình bị bỏ lại', 'gánh chuyện', 'bỏ lại'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['tinh thần độc lập, không cần ai phải chiều theo', 'độc lập', 'chiều theo'],
    ['giữ hết trong lòng, ít khi chịu nói ra cho nhẹ', 'giữ hết trong lòng', 'nói ra'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['không bị nếp cũ ràng buộc, dám sống khác đi', 'nếp cũ', 'sống khác'],
    ['trong lòng ít khi yên lâu, hay muốn đổi cho khác', 'ít khi yên', 'muốn đổi'],
  ),
};
