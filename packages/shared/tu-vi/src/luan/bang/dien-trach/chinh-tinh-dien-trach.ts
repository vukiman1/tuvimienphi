import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_DIEN_TRACH: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    [
      'nhà cửa khang trang, nơi ở có dáng vững vàng và được người ngoài nể',
      'khang trang',
      'dáng vững vàng',
    ],
    [
      'muốn mọi việc trong nhà theo ý mình, chuyện sắp đặt nơi ở khó nhường ai',
      'theo ý mình',
      'khó nhường',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['khéo bài trí, hay nghĩ cách sửa sang cho chỗ ở tiện và gọn', 'khéo bài trí', 'sửa sang'],
    [
      'chỗ ở hay xê dịch, dọn nhà hoặc đổi nơi làm việc nhiều lần mới yên',
      'hay xê dịch',
      'nhiều lần mới yên',
    ],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    ['nhà cửa cởi mở, hay đón khách, không khí trong nhà rộn ràng', 'cởi mở', 'đón khách'],
    [
      'bận việc bên ngoài nhiều, thời gian ở nhà ít nên việc nhà hay dồn lại',
      'bận việc bên ngoài',
      'dồn lại',
    ],
    ['nơi ở sáng sủa, thoáng đãng, nhà đất có tiếng là chỗ đàng hoàng', 'sáng sủa', 'thoáng đãng'],
    [
      'giữ được nơi ở cũng phải gắng sức nhiều, nhà cửa có lúc thiếu ấm',
      'gắng sức nhiều',
      'thiếu ấm',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    [
      'tích cóp bền bỉ, nhà đất thường do tự tay mình gây dựng nên',
      'tích cóp bền bỉ',
      'tự tay mình gây dựng',
    ],
    [
      'nhà cửa thiên về thực dụng, không khí trong nhà có phần khô và lặng',
      'thực dụng',
      'khô và lặng',
    ],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['không khí trong nhà êm đềm, về đến nhà là thấy thảnh thơi', 'êm đềm', 'thảnh thơi'],
    ['nơi ở lúc đầu còn tạm bợ, phải qua vài lần đổi chỗ mới ổn', 'tạm bợ', 'vài lần đổi chỗ'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['nề nếp trong nhà nghiêm, việc giữ nhà đất có nguyên tắc rõ', 'nề nếp', 'nguyên tắc rõ'],
    ['giấy tờ nhà đất dễ rắc rối, mua bán hay sang tên cần soát kỹ', 'giấy tờ', 'cần soát kỹ'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['giỏi giữ của, có của để dành và nhà đất được gìn giữ lâu bền', 'của để dành', 'lâu bền'],
    ['giữ của chặt, ngại thay đổi nơi ở dù chỗ cũ đã chật chội', 'giữ của chặt', 'ngại thay đổi'],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    ['ưa nhà cửa sạch sẽ, êm ả, chăm chút từng góc nhỏ', 'sạch sẽ', 'từng góc nhỏ'],
    [
      'hay lo nghĩ về chỗ ở, nhà chưa yên là trong lòng cũng chưa yên',
      'lo nghĩ về chỗ ở',
      'chưa yên',
    ],
    ['dễ có nhà đất, của để dành tích dần mà thành vững', 'dễ có nhà đất', 'tích dần'],
    ['nơi ở hay đổi, nhà đất có lúc phải bán đi rồi gây dựng lại', 'hay đổi', 'gây dựng lại'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    [
      'thích nhà cửa đẹp và tiện nghi, hợp sống nơi đông vui nhộn nhịp',
      'tiện nghi',
      'đông vui nhộn nhịp',
    ],
    ['ham sắm sửa đồ đạc, của để dành dễ hao vào những món chưa cần', 'ham sắm sửa', 'chưa cần'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['xem xét kỹ từng điều khoản, ít bị thiệt khi mua bán nhà đất', 'xem xét kỹ', 'ít bị thiệt'],
    [
      'dễ có lời ra tiếng vào quanh nhà đất, với hàng xóm cũng hay vướng chuyện',
      'lời ra tiếng vào',
      'hàng xóm',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['nhà cửa ngăn nắp, tươm tất, có người giúp lo việc nhà', 'ngăn nắp', 'tươm tất'],
    ['coi trọng thể diện nơi ở, sửa sang cho đẹp mắt nên tốn kém', 'thể diện', 'tốn kém'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['nhà có nếp cũ ấm cúng, dễ được người trên để lại chỗ ở', 'ấm cúng', 'người trên để lại'],
    [
      'hay lo xa chuyện nhà, việc nhỏ trong nhà cũng muốn tự tay coi sóc',
      'lo xa',
      'tự tay coi sóc',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['quyết đoán khi chọn nơi ở, dám tự mình lập nên nhà cửa', 'quyết đoán', 'tự mình lập'],
    [
      'khó giữ nhà đất cũ, chỗ ở thường phải đổi theo những bước ngoặt',
      'khó giữ nhà đất cũ',
      'bước ngoặt',
    ],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    [
      'hợp cải tạo, làm mới không gian, biến chỗ cũ thành nơi ở hợp ý',
      'cải tạo',
      'làm mới không gian',
    ],
    ['nhà đất ban đầu dễ hao, phải phá cũ dựng mới mấy phen mới ổn', 'dễ hao', 'phá cũ dựng mới'],
  ),
};
