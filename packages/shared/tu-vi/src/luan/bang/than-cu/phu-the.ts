import type { ChinhTinhName } from '../../../sao-names.js';
import { Sac } from '../../luan-de.js';
import { cell, type CellLuan } from '../cell-luan.js';

/**
 * Thân cư Phu Thê: đời ngả về hôn nhân và người bạn đời. Mệnh đề ở đây nói về NGƯỜI ẤY và về quan
 * hệ giữa hai người, không nói về bản thân hay sự nghiệp.
 */
export const THAN_CU_PHU_THE: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    ['người bạn đời có vị thế, ra ngoài được người ta nể', 'vị thế', 'được người ta nể'],
    ['quen được coi trọng nên không dễ chiều', 'được coi trọng', 'không dễ chiều'],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['người bạn đời nhanh trí, bàn chuyện gì cũng hợp', 'nhanh trí', 'bàn chuyện'],
    ['hay đổi ý nên khó đoán được người ấy muốn gì', 'đổi ý', 'khó đoán'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    ['người bạn đời thực tế, lo được phần kinh tế cho nhà', 'thực tế', 'kinh tế'],
    ['ít lời ngọt nên tình cảm nhiều khi thấy khô', 'lời ngọt', 'thấy khô'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['người bạn đời tính hiền, sống chung dễ chịu', 'tính hiền', 'dễ chịu'],
    ['thiếu quyết đoán nên việc lớn khó dựa vào', 'quyết đoán', 'việc lớn'],
  ),
  'Liêm Trinh': cell(
    'Liêm Trinh',
    ['người bạn đời có cá tính rõ và giữ nguyên tắc của mình', 'cá tính', 'nguyên tắc'],
    ['cả hai đều giữ ý mình nên không khí dễ căng', 'giữ ý mình', 'dễ căng'],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['người bạn đời vững vàng, biết vun vén cho nhà', 'vững vàng', 'vun vén'],
    ['giữ kẽ, ít khi mở lòng ra hết với mình', 'giữ kẽ', 'mở lòng'],
  ),
  'Thái Âm': cell(
    'Thái Âm',
    ['người bạn đời dịu dàng, chăm chút từng chuyện nhỏ', 'dịu dàng', 'chuyện nhỏ'],
    ['hay giận trong lòng mà không nói ra', 'giận trong lòng', 'không nói ra'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['người bạn đời thẳng thắn, có gì nói thẳng ra', 'thẳng thắn', 'nói thẳng'],
    ['lời qua tiếng lại nhiều, chuyện nhỏ cũng thành cãi', 'lời qua tiếng lại', 'thành cãi'],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['người bạn đời chu đáo, biết giữ ý tứ với hai bên', 'chu đáo', 'giữ ý tứ'],
    ['coi trọng hình thức nên nhiều khi nặng về bề ngoài', 'hình thức', 'bề ngoài'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['người bạn đời chín chắn, có phần như người đỡ đầu', 'chín chắn', 'người đỡ đầu'],
    ['khoảng cách tuổi tác hoặc cách nghĩ khá rõ', 'khoảng cách', 'cách nghĩ'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['người bạn đời mạnh mẽ, tự chủ, không dựa dẫm', 'mạnh mẽ', 'tự chủ'],
    ['hai bên đều cứng nên ít ai chịu nhường trước', 'đều cứng', 'nhường trước'],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['người bạn đời khác biệt, không sống theo khuôn ai', 'khác biệt', 'khuôn'],
    ['duyên có sóng, dễ gián đoạn rồi mới nối lại', 'có sóng', 'gián đoạn'],
  ),

  'Thái Dương': {
    chung: [
      {
        y: 'người bạn đời tính tình sáng sủa, thẳng thắn, không ưa vòng vo',
        do: ['Thái Dương'],
        sac: Sac.Thuan,
        trong: 86,
        tuKhoa: ['sáng sủa', 'thẳng thắn', 'vòng vo'],
      },
      {
        y: 'Thái Dương chủ sự bộc trực nên hai người dễ va nhau ở lời nói hơn ở lòng dạ',
        do: ['Thái Dương'],
        sac: Sac.Nghich,
        trong: 72,
        tuKhoa: ['bộc trực', 'va nhau', 'lời nói'],
      },
    ],
    theoBac: {
      M: [
        {
          y: 'người ấy có chỗ đứng riêng, được người ngoài nể trọng',
          do: ['Thái Dương'],
          sac: Sac.Thuan,
          trong: 92,
          tuKhoa: ['chỗ đứng', 'nể trọng'],
        },
      ],
      V: [
        {
          y: 'người ấy rộng rãi, biết lo cho người khác',
          do: ['Thái Dương'],
          sac: Sac.Thuan,
          trong: 84,
          tuKhoa: ['rộng rãi', 'biết lo'],
        },
      ],
      H: [
        {
          y: 'dễ mệt vì gánh vác, sáng với người ngoài mà mỏi ở trong nhà',
          do: ['Thái Dương'],
          sac: Sac.Nghich,
          trong: 82,
          tuKhoa: ['gánh vác', 'mỏi'],
        },
      ],
    },
  },

  'Tham Lang': {
    chung: [
      {
        y: 'người bạn đời hoạt bát, khéo giao thiệp và biết cách chiều lòng người',
        do: ['Tham Lang'],
        sac: Sac.Thuan,
        trong: 88,
        tuKhoa: ['hoạt bát', 'giao thiệp', 'chiều lòng'],
      },
      {
        y: 'Tham Lang chủ đào hoa nên tình duyên dễ nhiều mối, khó dứt khoát',
        do: ['Tham Lang'],
        sac: Sac.Nghich,
        trong: 80,
        tuKhoa: ['đào hoa', 'nhiều mối', 'dứt khoát'],
      },
    ],
    theoBac: {
      Đ: [
        {
          y: 'nét phong lưu chuyển thành sức hút lành mạnh',
          do: ['Tham Lang'],
          sac: Sac.HoaGiai,
          trong: 65,
          tuKhoa: ['phong lưu', 'sức hút'],
        },
      ],
    },
  },
};
