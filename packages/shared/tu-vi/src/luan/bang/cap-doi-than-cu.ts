import type { CungName } from '../../dia-ban.js';
import { Sac } from '../luan-de.js';
import type { CellLuan } from './cell-luan.js';

/**
 * Ô riêng cho tổ hợp hai chính tinh cùng toạ thủ. Được ưu tiên hơn phần ghép từ hai ô sao đơn.
 *
 * Cần có vì cặp đôi không phải lúc nào cũng bằng tổng hai phần: Sát Phá Tham hay Cơ Nguyệt Đồng
 * Lương là cách cục có tên, luận theo tổ hợp chứ không cộng dồn. Bảng này thưa và sẽ dày lên dần;
 * cặp nào chưa có thì ghép, đọc được nhưng chỉ là xấp xỉ.
 */
export const CAP_DOI_THAN_CU: Readonly<
  Partial<Record<string, Partial<Record<CungName, CellLuan>>>>
> = {
  'Liêm Trinh + Tham Lang': {
    'Phu Thê': {
      chung: [
        {
          y: 'người bạn đời có sức hút, giỏi giao tiếp và không cam chịu an phận',
          do: ['Liêm Trinh', 'Tham Lang'],
          sac: Sac.Thuan,
          trong: 90,
          tuKhoa: ['sức hút', 'giao tiếp', 'an phận'],
        },
        {
          y: 'cả hai đều là sao đào hoa nên đường tình duyên nhiều sóng, dễ dang dở trước khi định',
          do: ['Liêm Trinh', 'Tham Lang'],
          sac: Sac.Nghich,
          trong: 85,
          tuKhoa: ['đào hoa', 'nhiều sóng', 'dang dở'],
        },
        {
          y: 'duyên đến muộn thì bền hơn duyên đến sớm',
          do: ['Tham Lang'],
          sac: Sac.HoaGiai,
          trong: 60,
          tuKhoa: ['muộn', 'bền'],
        },
      ],
    },
  },
};
