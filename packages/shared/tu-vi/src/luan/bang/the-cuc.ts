import type { HoaName } from '../../tu-hoa.js';
import { Sac, type LuanDe } from '../luan-de.js';

const de = (y: string, sac: Sac, trong: number, ...tuKhoa: string[]): LuanDe => ({
  y,
  do: [],
  sac,
  trong,
  tuKhoa,
});

/** Tuần và Triệt án ngữ. Hiện chúng đã tác động ngầm qua trọng số; đây là phần nói thành lời. */
export const AN_NGU_LUAN: Readonly<Record<'Tuần' | 'Triệt', readonly LuanDe[]>> = {
  Tuần: [
    de(
      'có Tuần án ngữ nên việc ở cung này hay phải qua một lần trì hoãn mới thành',
      Sac.Nghich,
      84,
      'Tuần án ngữ',
      'trì hoãn',
    ),
    de(
      'án ngữ làm nhẹ cả mặt tốt lẫn mặt xấu, nên đọc mọi kết luận ở mức vừa phải',
      Sac.HoaGiai,
      80,
      'làm nhẹ',
      'vừa phải',
    ),
  ],
  Triệt: [
    de(
      'có Triệt án ngữ nên nửa đầu đời ở phần này vất hơn nửa sau',
      Sac.Nghich,
      86,
      'Triệt án ngữ',
      'nửa đầu',
    ),
    de(
      'qua được đoạn bị cắt ngang thì về sau lại hanh hơn',
      Sac.HoaGiai,
      78,
      'cắt ngang',
      'hanh hơn',
    ),
  ],
};

/** Tứ hoá rơi vào cung. Cũng đang tác động ngầm qua trọng số mà bài chưa hề nhắc tên. */
export const TU_HOA_LUAN: Readonly<Record<HoaName, LuanDe>> = {
  'Hóa Lộc': de(
    'có Hoá Lộc nên phần này thường có nguồn, không đến nỗi bí đường',
    Sac.Thuan,
    84,
    'Hoá Lộc',
    'có nguồn',
  ),
  'Hóa Quyền': de(
    'có Hoá Quyền nên tiếng nói ở phần này có trọng lượng',
    Sac.Thuan,
    84,
    'Hoá Quyền',
    'trọng lượng',
  ),
  'Hóa Khoa': de(
    'có Hoá Khoa nên phần này dễ được ghi nhận và có tiếng',
    Sac.Thuan,
    82,
    'Hoá Khoa',
    'ghi nhận',
  ),
  'Hóa Kỵ': de(
    'có Hoá Kỵ nên phần này hay vướng, được việc thì cũng phải qua trắc trở',
    Sac.Nghich,
    86,
    'Hoá Kỵ',
    'vướng',
  ),
};
