import type { ChinhTinhName } from '../../../sao-names.js';
import { cell, cellTheoDoSang, type CellLuan } from '../cell-luan.js';

export const CHINH_TINH_TAT_ACH: Partial<Record<ChinhTinhName, CellLuan>> = {
  'Tử Vi': cell(
    'Tử Vi',
    [
      'thể trạng nhìn chung vững vàng, ốm vặt thường qua nhanh mà ít để lại dư âm',
      'vững vàng',
      'qua nhanh',
    ],
    [
      'đường ăn uống là chỗ cần để ý, ăn thất thường thì dễ đầy bụng khó tiêu',
      'ăn thất thường',
      'khó tiêu',
    ],
  ),
  'Thiên Cơ': cell(
    'Thiên Cơ',
    ['cơ thể nhanh nhạy, biết nghỉ đúng lúc thì hồi sức khá nhanh', 'nhanh nhạy', 'hồi sức'],
    [
      'hay nghĩ ngợi nhiều, đầu óc căng lâu dễ khó ngủ và mỏi vai gáy',
      'nghĩ ngợi nhiều',
      'khó ngủ',
    ],
  ),
  'Thái Dương': cellTheoDoSang(
    'Thái Dương',
    [
      'tinh thần hướng ngoại, năng vận động nên người thường có sinh khí',
      'năng vận động',
      'sinh khí',
    ],
    ['mắt và đầu là chỗ cần giữ gìn, thức khuya nhiều dễ mỏi mắt nhức đầu', 'mỏi mắt', 'nhức đầu'],
    ['người tươi tỉnh, sức bền tốt, làm việc ban ngày ít khi thấy đuối', 'tươi tỉnh', 'sức bền'],
    ['dễ uể oải, thiếu sức sống, nên ra nắng và vận động đều đặn', 'uể oải', 'vận động đều đặn'],
  ),
  'Vũ Khúc': cell(
    'Vũ Khúc',
    [
      'thể chất rắn rỏi, chịu được việc nặng và nhịp sống bận rộn',
      'rắn rỏi',
      'chịu được việc nặng',
    ],
    ['đường thở và cổ họng cần giữ ấm, trở trời là dễ ho hay hụt hơi', 'giữ ấm', 'hụt hơi'],
  ),
  'Thiên Đồng': cell(
    'Thiên Đồng',
    ['tinh thần thư thái, ít khi để lo âu đè nặng lên cơ thể', 'thư thái', 'lo âu'],
    ['sống an nhàn quá dễ lười vận động, người ì ạch và tích nước', 'lười vận động', 'ì ạch'],
  ),
  'Liêm Trinh': cellTheoDoSang(
    'Liêm Trinh',
    ['có sức chịu đựng, gặp lúc mệt vẫn gắng gượng qua được', 'sức chịu đựng', 'gắng gượng'],
    [
      'căng thẳng lâu dễ nóng trong người, da hay nổi mẩn khi thiếu ngủ',
      'nóng trong người',
      'nổi mẩn',
    ],
    ['khí huyết lưu thông, sắc mặt hồng hào, ít khi ốm nặng', 'khí huyết lưu thông', 'hồng hào'],
    [
      'khí huyết dễ kém điều hoà, thấy bứt rứt trong người thì nên chậm lại nghỉ ngơi',
      'kém điều hoà',
      'bứt rứt',
    ],
  ),
  'Thiên Phủ': cell(
    'Thiên Phủ',
    ['thể trạng đầy đặn, có sức đề kháng, lâu lâu mới ốm một lần', 'đầy đặn', 'sức đề kháng'],
    ['ăn uống ngon miệng nên dễ quá đà, người nặng nề và tăng cân', 'quá đà', 'nặng nề'],
  ),
  'Thái Âm': cellTheoDoSang(
    'Thái Âm',
    [
      'biết chăm chút bản thân, nhạy với những thay đổi nhỏ của cơ thể',
      'chăm chút bản thân',
      'thay đổi nhỏ',
    ],
    ['tâm trạng ảnh hưởng nhiều tới thân thể, buồn lâu là thấy người mệt', 'tâm trạng', 'buồn lâu'],
    ['giấc ngủ êm, cơ thể điều hoà, tinh thần dịu và ổn định', 'giấc ngủ êm', 'điều hoà'],
    ['dễ mất ngủ, hay lạnh tay chân, nên giữ ấm và giữ nhịp ngủ nghỉ', 'mất ngủ', 'nhịp ngủ nghỉ'],
  ),
  'Tham Lang': cell(
    'Tham Lang',
    ['sức sống dồi dào, ham hoạt động, ít khi chịu ngồi yên', 'sức sống dồi dào', 'ham hoạt động'],
    ['ham vui, ăn uống và thức khuya quá độ nên dễ hao sức lúc nào không hay', 'quá độ', 'hao sức'],
  ),
  'Cự Môn': cell(
    'Cự Môn',
    ['hay để ý cơ thể, có gì khác lạ là sớm nhận ra', 'để ý cơ thể', 'sớm nhận ra'],
    [
      'miệng, họng và đường tiêu hoá là chỗ cần giữ, ăn vội nói nhiều dễ thấy khó chịu',
      'đường tiêu hoá',
      'ăn vội',
    ],
  ),
  'Thiên Tướng': cell(
    'Thiên Tướng',
    ['thể trạng cân đối, khi mệt thường có người bên cạnh chăm sóc', 'cân đối', 'chăm sóc'],
    ['da dễ nhạy cảm, đổi thời tiết hay đổi chỗ ở là dễ mẩn ngứa', 'da dễ nhạy cảm', 'mẩn ngứa'],
  ),
  'Thiên Lương': cell(
    'Thiên Lương',
    ['ốm đau thường gặp được cách chăm đúng, qua khỏi nhẹ nhàng', 'cách chăm đúng', 'qua khỏi'],
    ['hay lo xa về sức khoẻ, lo nhiều quá lại tự làm mình căng thẳng', 'lo xa', 'căng thẳng'],
  ),
  'Thất Sát': cell(
    'Thất Sát',
    ['sức bền tốt, chịu được nhịp làm việc dồn dập trong thời gian dài', 'sức bền tốt', 'dồn dập'],
    [
      'tính vội nên dễ va quẹt, trầy xước, đi đường và làm việc tay chân nên chậm lại',
      'va quẹt',
      'chậm lại',
    ],
  ),
  'Phá Quân': cell(
    'Phá Quân',
    ['hồi phục nhanh sau những lần kiệt sức, sức bật mạnh', 'hồi phục nhanh', 'sức bật'],
    ['nhịp sinh hoạt thất thường, hay làm quá sức rồi mới chịu nghỉ', 'thất thường', 'quá sức'],
  ),
};
