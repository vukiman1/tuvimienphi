import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_HUYNH_DE: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['trong anh chị em có người đứng đắn, có uy, là chỗ dựa cho cả nhà', 'có uy', 'chỗ dựa'],
    ['anh em ai cũng có cái tôi lớn, khó nhường nhau một bước', 'cái tôi lớn', 'khó nhường nhau'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['anh chị em nhanh trí, khéo bày cách gỡ rối cho nhau', 'nhanh trí', 'gỡ rối'],
    ['anh em mỗi người một ngả, ít khi tụ họp được lâu', 'mỗi người một ngả', 'tụ họp được lâu'],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    ['anh em thẳng thắn, có gì cũng nói ra cho rõ ràng', 'thẳng thắn', 'rõ ràng'],
    [
      'anh em hướng ra bên ngoài nhiều, ít dịp ngồi lại cùng nhau',
      'hướng ra bên ngoài',
      'ít dịp ngồi lại',
    ],
    ['trong anh em có người nổi bật, hào hiệp và sẵn lòng kéo nhau lên', 'nổi bật', 'hào hiệp'],
    [
      'anh em dễ hiểu lầm nhau, có người gắng sức mà thấy mình chưa được ghi nhận',
      'hiểu lầm',
      'chưa được ghi nhận',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['anh chị em cứng cỏi, tự lập, sòng phẳng với nhau', 'tự lập', 'sòng phẳng'],
    ['giữa anh em ít lời ân cần, thương nhau mà khó bày tỏ', 'lời ân cần', 'khó bày tỏ'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['anh em hoà thuận, dễ chịu, ở cạnh nhau thấy nhẹ lòng', 'hoà thuận', 'nhẹ lòng'],
    ['anh em đều ngại va chạm, chuyện cần nói thẳng hay bị để đó', 'ngại va chạm', 'bị để đó'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['anh em trọng nghĩa, sống ngay thẳng, đã hứa là giữ lời', 'trọng nghĩa', 'giữ lời'],
    [
      'anh em dễ căng thẳng vì tính bướng, ai cũng muốn phần phải về mình',
      'tính bướng',
      'phần phải',
    ],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['anh chị em biết đùm bọc nhau, có người vững vàng để nương', 'đùm bọc', 'vững vàng'],
    ['anh em giữ ý, mỗi người lo phần mình nên ít khi thật sự mở lòng', 'giữ ý', 'mở lòng'],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    ['tình anh em lặng lẽ mà bền, quan tâm nhau qua việc làm', 'lặng lẽ mà bền', 'qua việc làm'],
    [
      'anh em hay cất chuyện buồn trong lòng, ít khi nói cho nhau nghe',
      'cất chuyện buồn',
      'nói cho nhau nghe',
    ],
    [
      'anh chị em dịu dàng, gần gũi, có điều gì cũng tìm nhau chia sẻ',
      'dịu dàng',
      'tìm nhau chia sẻ',
    ],
    ['anh em dễ xa cách, có điều tủi thì để riêng mình biết', 'xa cách', 'để riêng mình biết'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['anh em lanh lợi, giỏi giao thiệp, ở cùng nhau thì vui', 'lanh lợi', 'giỏi giao thiệp'],
    ['tình anh em dễ thành hời hợt, hợp nhau lúc vui mà thưa lúc khó', 'hời hợt', 'thưa lúc khó'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['anh em ăn nói có lý lẽ, dám góp ý thẳng cho nhau', 'có lý lẽ', 'góp ý thẳng'],
    [
      'anh em dễ bất đồng qua lời ăn tiếng nói, nói chưa khéo là thành xa nhau',
      'bất đồng qua lời',
      'thành xa nhau',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['anh em tốt bụng, có chuyện là đứng ra bênh vực nhau', 'tốt bụng', 'bênh vực nhau'],
    ['anh em nể nang nhau quá, điều không vừa ý lại ngại nói ra', 'nể nang', 'ngại nói ra'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['trong anh em có người như anh cả, biết che chở và nhường nhịn', 'che chở', 'nhường nhịn'],
    [
      'anh em hay lo thay cho nhau, bao bọc quá tay thành ra ôm việc của người khác',
      'lo thay',
      'bao bọc quá tay',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['anh em gan dạ, có chuyện là dám đứng mũi chịu sào', 'gan dạ', 'đứng mũi chịu sào'],
    [
      'anh em ai cũng cứng tính, dễ xung khắc và mỗi người sống một phương',
      'xung khắc',
      'một phương',
    ],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['anh em mạnh dạn, dám nghĩ khác và làm khác', 'mạnh dạn', 'làm khác'],
    ['quan hệ anh em hay đổi nhịp, lúc thân thiết lúc lại thưa vắng', 'đổi nhịp', 'thưa vắng'],
  ),
};
