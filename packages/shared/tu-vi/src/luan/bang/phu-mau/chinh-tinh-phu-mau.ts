import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_PHU_MAU: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['bậc sinh thành có uy, là chỗ dựa vững để mình noi theo', 'chỗ dựa vững', 'noi theo'],
    [
      'nếp nhà nặng tôn ti, giữa mình và cha mẹ có khoảng cách bề trên khó xoá',
      'tôn ti',
      'bề trên',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['cha mẹ khéo léo, tinh ý, hay chỉ cho mình cách nghĩ thấu đáo', 'tinh ý', 'nghĩ thấu đáo'],
    [
      'tình thân với gia đình gốc lúc gần lúc xa, dễ đổi theo hoàn cảnh',
      'lúc gần lúc xa',
      'đổi theo hoàn cảnh',
    ],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    [
      'ảnh hưởng từ phía cha thiên về lối sống thẳng thắn, trọng danh dự',
      'lối sống thẳng thắn',
      'trọng danh dự',
    ],
    [
      'sự gần gũi với phía cha dễ thưa vắng, ít dịp trò chuyện thân tình',
      'thưa vắng',
      'trò chuyện thân tình',
    ],
    ['phía cha rộng lượng, truyền cho mình tinh thần sáng sủa', 'rộng lượng', 'tinh thần sáng sủa'],
    ['phía cha lo toan nhiều, vất vả mà ít người thấy', 'lo toan nhiều', 'ít người thấy'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['nếp dạy cứng cỏi, rèn cho mình tính tự lập từ sớm', 'cứng cỏi', 'tự lập từ sớm'],
    [
      'tình cảm trong gia đình gốc ít được nói thành lời, đôi khi thấy khô khan',
      'nói thành lời',
      'khô khan',
    ],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['tuổi thơ có phần êm đềm, người lớn trong gia đình hiền hoà, dễ tính', 'êm đềm', 'hiền hoà'],
    [
      'được nuông chiều nhiều nên chậm cứng cáp, quen trông vào gia đình',
      'nuông chiều',
      'trông vào gia đình',
    ],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    [
      'gia đình gốc coi trọng lẽ phải, dạy mình sống ngay thẳng và giữ chữ tín',
      'lẽ phải',
      'chữ tín',
    ],
    [
      'giữa mình và cha mẹ dễ bất đồng quan điểm, không ai chịu lùi một bước',
      'bất đồng quan điểm',
      'lùi một bước',
    ],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['gia đình gốc vững vàng, là nơi để mình tìm về khi mỏi mệt', 'vững vàng', 'tìm về'],
    [
      'người lớn trong gia đình kỹ tính, lo liệu trước mọi điều nên mình ít được tự chọn',
      'kỹ tính',
      'tự chọn',
    ],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    ['phía mẹ chu toàn chuyện nhà, để ý đến từng điều nhỏ', 'chu toàn chuyện nhà', 'từng điều nhỏ'],
    ['tình cảm với phía mẹ kín đáo, thương mà khó bày tỏ nên dễ tủi thân', 'kín đáo', 'tủi thân'],
    ['tình thương từ phía mẹ sâu đậm, dịu dàng và tinh tế', 'sâu đậm', 'tinh tế'],
    ['phía mẹ hay ôm lo âu một mình, nỗi buồn ít khi nói ra', 'lo âu một mình', 'ít khi nói ra'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['nếp nhà cởi mở, xởi lởi, dạy mình cách giao thiệp rộng', 'xởi lởi', 'giao thiệp'],
    ['sự quan tâm của gia đình đôi lúc lơ là, mình sớm phải tự xoay xở', 'lơ là', 'tự xoay xở'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    [
      'được dạy bằng lý lẽ nhiều hơn mệnh lệnh, nhờ vậy có óc phán đoán riêng',
      'lý lẽ',
      'óc phán đoán',
    ],
    [
      'giữa hai thế hệ dễ hiểu lầm qua lời nói, nói chưa trọn ý là thành khúc mắc',
      'hiểu lầm',
      'khúc mắc',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['cha mẹ công bằng, hay đứng ra che chắn khi mình gặp chuyện', 'công bằng', 'che chắn'],
    ['thể diện được đặt nặng trong gia đình, có điều riêng khó mở lời', 'thể diện', 'khó mở lời'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    [
      'phúc ấm gia đình dày, người đi trước thường chỉ đường cho mình đúng lúc',
      'phúc ấm',
      'chỉ đường',
    ],
    ['người đi trước hay răn dạy, lo xa thay mình đến mức thấy chật chội', 'răn dạy', 'lo xa'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['lớn lên trong nếp nhà nghiêm, mình rèn được bản lĩnh đứng vững', 'bản lĩnh', 'đứng vững'],
    [
      'tình thân với cha mẹ ít êm ả, mình thường sớm rời vòng tay gia đình để tự bước',
      'ít êm ả',
      'rời vòng tay',
    ],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['được để tự do khám phá, dám nghĩ khác lối mòn của gia đình', 'tự do khám phá', 'lối mòn'],
    [
      'nếp sống gia đình gốc có lúc xáo trộn, quan niệm đôi bên dễ vênh nhau',
      'xáo trộn',
      'vênh nhau',
    ],
  ),
};
