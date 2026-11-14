import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_PHUC_DUC: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['được hưởng phúc dày từ dòng họ, trong lòng vững vàng và tự trọng', 'phúc dày', 'vững vàng'],
    [
      'mang nặng kỳ vọng giữ thanh danh dòng họ, ít khi cho phép mình lơi tay',
      'kỳ vọng',
      'thanh danh',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    [
      'ham tìm hiểu triết lý, có thú đọc và nghiền ngẫm những điều sâu xa',
      'triết lý',
      'nghiền ngẫm',
    ],
    ['tâm trí hay xao động, khó ngồi yên với một niềm tin lâu dài', 'xao động', 'niềm tin'],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    ['sống quang minh, trong lòng ít điều khuất tất phải giấu', 'quang minh', 'khuất tất'],
    [
      'dễ hao tâm vì việc chung của họ hàng, ít dành phần yên cho mình',
      'hao tâm',
      'phần yên cho mình',
    ],
    [
      'phúc phần sáng sủa, dòng họ có nếp sống rộng rãi và được tiếng thơm',
      'sáng sủa',
      'tiếng thơm',
    ],
    ['lòng nhiều lúc u uất, phải tự thắp lửa cho mình mới thấy ấm', 'u uất', 'tự thắp lửa'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['tinh thần cứng cỏi, tự gầy dựng sự an ổn bằng sức mình', 'cứng cỏi', 'bằng sức mình'],
    ['họ hàng ít gắn bó, chuyện trong lòng thường tự mình gánh', 'ít gắn bó', 'tự mình gánh'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['tâm tính hồn hậu, giữ được nét trẻ trung trong tâm hồn rất lâu', 'hồn hậu', 'trẻ trung'],
    ['dễ mải theo thú vui nhẹ, gặp việc nặng lòng thì muốn lánh đi', 'thú vui nhẹ', 'muốn lánh'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['giữ kỷ cương trong nếp sống, biết tự răn mình rất nghiêm', 'kỷ cương', 'tự răn'],
    ['trong lòng dễ có điều ấm ức giấu kín, khó buông chuyện cũ', 'ấm ức', 'khó buông'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['dòng họ có nền nếp, ông bà để lại phần phúc che chở cho đời sau', 'nền nếp', 'che chở'],
    [
      'ưa sự yên ổn quen thuộc, ngại thử những điều mới cho tâm hồn',
      'yên ổn quen thuộc',
      'ngại thử',
    ],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    [
      'tâm hồn mềm mại, mê những thú lặng lẽ như đọc sách, nghe nhạc, ngắm cảnh',
      'mềm mại',
      'thú lặng lẽ',
    ],
    ['tâm trạng dễ lên xuống theo những chuyện nhỏ người khác không để ý', 'lên xuống'],
    ['phúc phần êm đềm, trong lòng thường giữ được sự thanh thản', 'êm đềm', 'thanh thản'],
    ['hay trằn trọc, lo nghĩ về đêm, cần tìm cách giữ giấc ngủ yên', 'trằn trọc', 'giấc ngủ'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['nhiều sở thích, biết tìm niềm vui để làm mới tinh thần', 'nhiều sở thích', 'làm mới'],
    ['dễ sa đà vào thú vui, khó giữ sự điều độ cho tâm trí', 'sa đà', 'điều độ'],
  ),
  'Cự Môn': cellTheoDoSang(
    'Cự Môn',
    ['niềm tin được đúc kết từ suy xét, không dễ bị lung lay', 'đúc kết', 'lung lay'],
    [
      'họ hàng dễ có chuyện thị phi, lời ra tiếng vào làm lòng không yên',
      'thị phi',
      'lời ra tiếng vào',
    ],
    ['lời nói có sức nặng, được họ hàng tìm đến để hỏi ý', 'sức nặng', 'hỏi ý'],
    ['hay ôm mối nghi trong lòng, khó tin trọn vào điều gì', 'mối nghi', 'tin trọn'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['có lòng nghĩa hiệp, sống tử tế nên tích thêm phúc cho mình', 'nghĩa hiệp', 'tích thêm phúc'],
    ['dễ vì nể nang mà ôm chuyện của người khác vào lòng', 'nể nang', 'ôm chuyện'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['có duyên với việc thiện, tìm được bình an qua sự tu dưỡng', 'việc thiện', 'tu dưỡng'],
    [
      'hay tự nhận phần lo cho cả họ, lòng ít khi thật sự nhẹ',
      'tự nhận phần lo',
      'ít khi thật sự nhẹ',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['ý chí mạnh, gặp sóng gió vẫn tự đứng dậy được', 'ý chí mạnh', 'tự đứng dậy'],
    ['tâm trí ít khi được thong thả, hay thấy mình phải gồng lên', 'thong thả', 'gồng lên'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    [
      'dám thay đổi niềm tin cũ khi thấy nó không còn hợp với mình',
      'thay đổi niềm tin',
      'không còn hợp',
    ],
    ['họ hàng dễ sống phân tán, ít dịp sum họp đông đủ', 'phân tán', 'ít dịp sum họp'],
  ),
};
