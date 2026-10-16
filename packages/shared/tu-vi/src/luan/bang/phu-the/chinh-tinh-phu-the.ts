import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_PHU_THE: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    [
      'người bạn đời có phong thái đĩnh đạc, đứng cạnh ai cũng toát ra vẻ đáng tin',
      'phong thái đĩnh đạc',
      'đáng tin',
    ],
    [
      'người ấy cần được tôn trọng đúng mức, hai bên dễ ngấm ngầm giành phần quyết',
      'tôn trọng đúng mức',
      'giành phần quyết',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['người bạn đời lanh lợi và tinh ý, hiểu được cả điều mình chưa kịp nói', 'lanh lợi', 'tinh ý'],
    [
      'người ấy suy tính nhiều, tâm trạng đổi theo từng lúc nên đường duyên ít khi phẳng lặng',
      'suy tính nhiều',
      'đổi theo từng lúc',
    ],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    [
      'người bạn đời sống minh bạch, có gì cũng muốn nói cho rõ ràng',
      'sống minh bạch',
      'nói cho rõ ràng',
    ],
    [
      'người ấy mải lo chuyện bên ngoài, dành cho hai người ít thời gian hơn mong đợi',
      'mải lo chuyện bên ngoài',
      'ít thời gian',
    ],
    [
      'người bạn đời ấm áp và hào sảng, ở cạnh thấy được tiếp thêm sức sống',
      'hào sảng',
      'tiếp thêm sức sống',
    ],
    [
      'người ấy lo toan nhiều mà ít được ghi nhận, mỏi mệt dễ trút thành cáu gắt giữa hai người',
      'ít được ghi nhận',
      'cáu gắt',
    ],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    [
      'người bạn đời quả quyết, đáng cậy nhờ khi cần có người đứng ra lo liệu',
      'quả quyết',
      'đứng ra lo liệu',
    ],
    [
      'người ấy kiệm lời và cứng rắn, chuyện tình cảm dễ khô khan nếu không chủ động hâm nóng',
      'kiệm lời',
      'khô khan',
    ],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['người bạn đời ôn hoà, dễ tính, ở bên nhau thấy nhẹ nhõm', 'ôn hoà', 'nhẹ nhõm'],
    [
      'người ấy ngại nói thẳng nên chuyện cần nói rõ giữa hai người hay bị gác lại',
      'ngại nói thẳng',
      'bị gác lại',
    ],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['người bạn đời sống có khí tiết, yêu ghét rõ ràng', 'khí tiết', 'yêu ghét rõ ràng'],
    ['tình cảm giữa hai người nồng nhưng dễ sinh ghen tuông và giận dỗi', 'ghen tuông', 'giận dỗi'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['người bạn đời điềm đạm, rộng lượng, biết lo toan chu toàn', 'điềm đạm', 'lo toan chu toàn'],
    ['người ấy bảo thủ trong nếp nghĩ, đã định điều gì thì khó lay', 'bảo thủ', 'khó lay'],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    [
      'người bạn đời hướng về tổ ấm, coi trọng những phút riêng của hai người',
      'hướng về tổ ấm',
      'phút riêng',
    ],
    [
      'người ấy nhạy cảm, buồn vui thất thường, dễ tủi thân khi thấy mình bị lơ là',
      'nhạy cảm',
      'tủi thân',
    ],
    [
      'người bạn đời giàu tình cảm, quan tâm bằng những cử chỉ lặng lẽ mà tinh tế',
      'giàu tình cảm',
      'cử chỉ lặng lẽ',
    ],
    [
      'người ấy hay khép mình, nỗi buồn cất kín nên mình khó đoán được tâm tư',
      'khép mình',
      'cất kín',
    ],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    [
      'người bạn đời có sức hấp dẫn, biết làm cho đường duyên thêm màu sắc',
      'sức hấp dẫn',
      'thêm màu sắc',
    ],
    [
      'người ấy ham trải nghiệm, dễ chán khi tình cảm rơi vào nếp quen',
      'ham trải nghiệm',
      'rơi vào nếp quen',
    ],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['người bạn đời có chính kiến, nói chuyện sâu và sắc', 'chính kiến', 'sâu và sắc'],
    [
      'hai người dễ hiểu lầm nhau vì lời nói, một nghi ngờ nhỏ cũng thành khúc mắc lớn',
      'hiểu lầm',
      'khúc mắc',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    [
      'người bạn đời tử tế, công bằng, sẵn lòng che chắn cho người mình thương',
      'tử tế',
      'che chắn',
    ],
    [
      'người ấy dễ xuôi theo ý kiến người ngoài, nhiều khi nghe người khác hơn nghe mình',
      'ý kiến người ngoài',
      'nghe người khác',
    ],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['người bạn đời hiền hậu, biết che chở và nâng đỡ khi mình chênh vênh', 'hiền hậu', 'nâng đỡ'],
    [
      'người ấy hay khuyên răn, dễ khiến mình thấy bị bao bọc quá mức',
      'khuyên răn',
      'bao bọc quá mức',
    ],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['người bạn đời bản lĩnh, quyết đoán, gặp sóng gió vẫn đứng vững', 'bản lĩnh', 'đứng vững'],
    ['đường duyên buổi đầu nhiều va đập, hai cái tôi mạnh dễ đối đầu nhau', 'va đập', 'đối đầu'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    [
      'người bạn đời dám nghĩ dám làm, mang đến cho đường duyên nhiều điều mới',
      'dám nghĩ dám làm',
      'điều mới',
    ],
    [
      'đường duyên dễ trải qua xáo trộn, hai người cần đổi thay cách đối đãi với nhau mới tìm được chỗ yên ổn',
      'xáo trộn',
      'đổi thay',
    ],
  ),
};
