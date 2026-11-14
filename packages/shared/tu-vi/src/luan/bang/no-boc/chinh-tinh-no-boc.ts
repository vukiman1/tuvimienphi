import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_NO_BOC: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['quen biết người có vị thế, bạn bè đáng nể và nói có trọng lượng', 'có vị thế', 'đáng nể'],
    [
      'người dưới quyền có chính kiến mạnh, khó sai bảo theo đúng ý mình',
      'chính kiến mạnh',
      'khó sai bảo',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['bạn bè nhanh trí, hay góp được ý hay khi mình cần tính toán', 'nhanh trí', 'góp được ý hay'],
    [
      'quen nhiều người nhưng ít ai ở lại lâu, vòng bạn bè hay đổi thay',
      'ít ai ở lại lâu',
      'hay đổi thay',
    ],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    ['giao thiệp cởi mở, quen biết rộng ở nhiều giới khác nhau', 'cởi mở', 'quen biết rộng'],
    ['lo cho bạn bè nhiều hơn phần bạn bè lo lại cho mình', 'lo cho bạn bè', 'lo lại cho mình'],
    [
      'bạn bè quang minh, có người sẵn lòng nâng đỡ mình một cách công khai',
      'quang minh',
      'nâng đỡ',
    ],
    [
      'lòng tốt bỏ ra cho người quen dễ bị hiểu lầm, ít được đáp lại',
      'bị hiểu lầm',
      'ít được đáp lại',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['bạn bè thực tế, khi giúp thì giúp bằng việc làm cụ thể', 'thực tế', 'việc làm cụ thể'],
    [
      'quan hệ với bạn bè sòng phẳng mà hơi khô, ít người thân tới mức tâm sự',
      'sòng phẳng',
      'tới mức tâm sự',
    ],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['bạn bè hiền hoà, dễ chơi, ở cạnh nhau thấy thoải mái', 'hiền hoà', 'thoải mái'],
    [
      'bạn vui thì nhiều, lúc cần người cùng gánh việc khó lại thưa',
      'bạn vui thì nhiều',
      'lại thưa',
    ],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['chọn bạn có nguyên tắc, kết giao với người biết giữ chữ tín', 'nguyên tắc', 'chữ tín'],
    ['đòi hỏi người dưới quá chặt, dễ mất lòng những người cùng làm', 'quá chặt', 'mất lòng'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['có những người bạn lâu năm, người dưới quyền đáng tin cậy', 'bạn lâu năm', 'đáng tin cậy'],
    [
      'chọn bạn kỹ nên vòng quen biết hẹp, chậm mở rộng ra ngoài',
      'vòng quen biết hẹp',
      'chậm mở rộng',
    ],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    ['bạn bè tinh tế, chu đáo, nhớ cả những chuyện nhỏ của mình', 'tinh tế', 'chuyện nhỏ'],
    [
      'hay giữ khoảng cách, ít khi nói hết lòng mình với bạn bè',
      'giữ khoảng cách',
      'nói hết lòng mình',
    ],
    ['có người bạn tri kỷ, lặng lẽ đỡ mình vào lúc cần nhất', 'tri kỷ', 'lặng lẽ đỡ mình'],
    [
      'bạn bè đến rồi đi lặng lẽ, khó giữ được người thân thiết lâu dài',
      'đến rồi đi',
      'khó giữ được',
    ],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['giao du rộng, có bạn ở nhiều giới và dễ kết thân', 'giao du rộng', 'dễ kết thân'],
    ['dễ bị bạn bè rủ rê vào cuộc vui, bạn chơi nhiều mà bạn thật ít', 'rủ rê', 'bạn thật ít'],
  ),
  'Cự Môn': cellTheoDoSang(
    'Cự Môn',
    ['bạn bè thẳng thắn, dám nói thật điều mình chưa thấy', 'thẳng thắn', 'nói thật'],
    ['lời qua lại giữa bạn bè dễ thành hiểu lầm, phải giữ ý khi nói', 'hiểu lầm', 'giữ ý khi nói'],
    ['quanh mình có người ăn nói có lý lẽ, lời góp ý đáng nghe', 'có lý lẽ', 'đáng nghe'],
    ['dễ bị người quen nói ra nói vào sau lưng, vướng thị phi không đáng', 'sau lưng', 'thị phi'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['bạn bè trượng nghĩa, có người sẵn lòng đứng ra bênh vực mình', 'trượng nghĩa', 'bênh vực'],
    ['hay nể nang, vì giữ thể diện cho bạn mà nhận về phần khó', 'nể nang', 'giữ thể diện'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['gặp được người đi trước chỉ dẫn, bạn bè sống tử tế', 'người đi trước', 'tử tế'],
    [
      'hay đứng ra lo chuyện cho bạn, ôm cả phần việc của người khác',
      'lo chuyện cho bạn',
      'ôm cả phần việc',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['bạn bè cứng cỏi, gặp chuyện khó dám ra tay giúp ngay', 'cứng cỏi', 'dám ra tay'],
    ['người dưới quyền cứng đầu, hay cãi lại khi bị ép theo ý mình', 'cứng đầu', 'cãi lại'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['dám kết giao ngoài vòng quen cũ, hay gặp người mới mẻ', 'kết giao', 'người mới mẻ'],
    ['các nhóm bạn dễ hợp rồi tan, khó giữ một vòng quen biết lâu', 'hợp rồi tan', 'khó giữ'],
  ),
};
