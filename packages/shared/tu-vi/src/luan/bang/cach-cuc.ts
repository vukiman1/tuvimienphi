import type { NatalChart } from '../../cast-chart.js';
import { tamHopIndexes, xungChieuIndex } from '../../chi.js';
import type { ChinhTinhName, PhuTinhName } from '../../sao-names.js';
import { Sac, type LuanDe } from '../luan-de.js';

const de = (y: string, sac: Sac, trong: number, ...tuKhoa: string[]): LuanDe => ({
  y,
  do: [],
  sac,
  trong,
  tuKhoa,
});

interface CachCuc {
  readonly ten: string;
  readonly luan: readonly LuanDe[];
}

/**
 * Ba nhóm chính tinh chia theo tam hợp — cách chia cổ điển của mười bốn chính tinh. Nhận diện bằng
 * cách đếm số sao của nhóm có mặt trong tam hợp cục, vì cách cục là chuyện của cả tam hợp chứ không
 * của riêng cung đang xét.
 *
 * Ngưỡng đếm là cách nhận diện THỰC DỤNG, không phải luật cổ. Trường phái chặt hơn đòi đủ bộ và
 * đúng vị trí; ở đây lấy đủ ngưỡng là gọi tên, chấp nhận rộng tay hơn.
 */
const NHOM_CHINH_TINH: readonly {
  readonly ten: string;
  readonly sao: readonly ChinhTinhName[];
  readonly nguong: number;
  readonly luan: readonly LuanDe[];
}[] = [
  {
    ten: 'Sát Phá Tham',
    sao: ['Thất Sát', 'Phá Quân', 'Tham Lang'],
    nguong: 2,
    luan: [
      de(
        'cách Sát Phá Tham chủ biến động, hợp mở đường và làm cái chưa ai làm',
        Sac.Thuan,
        88,
        'Sát Phá Tham',
        'mở đường',
      ),
      de(
        'cũng vì hay đổi mà khó giữ mọi thứ yên lâu ở một chỗ',
        Sac.Nghich,
        80,
        'hay đổi',
        'yên lâu',
      ),
    ],
  },
  {
    ten: 'Cơ Nguyệt Đồng Lương',
    sao: ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'],
    nguong: 3,
    luan: [
      de(
        'cách Cơ Nguyệt Đồng Lương chủ ổn định, hợp việc cần bền và cần nghĩ',
        Sac.Thuan,
        88,
        'Cơ Nguyệt Đồng Lương',
        'cần bền',
      ),
      de('thiếu nét bung phá nên ít khi có bước nhảy lớn', Sac.Nghich, 78, 'bung phá', 'bước nhảy'),
    ],
  },
  {
    ten: 'Tử Phủ Vũ Tướng',
    sao: ['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'],
    nguong: 3,
    luan: [
      de(
        'cách Tử Phủ Vũ Tướng chủ quyền quý và ổn, hợp việc quản và việc giữ',
        Sac.Thuan,
        88,
        'Tử Phủ Vũ Tướng',
        'việc quản',
      ),
      de(
        'quen giữ nề nếp nên chậm xoay khi hoàn cảnh đổi gấp',
        Sac.Nghich,
        78,
        'nề nếp',
        'đổi gấp',
      ),
    ],
  },
];

/** Cặp phụ tinh đi đôi. Đủ cả hai trong tam hợp cục mới thành cách. */
const CAP_PHU_TINH: readonly {
  readonly ten: string;
  readonly sao: readonly [PhuTinhName, PhuTinhName];
  readonly luan: readonly LuanDe[];
}[] = [
  {
    ten: 'Xương Khúc',
    sao: ['Văn Xương', 'Văn Khúc'],
    luan: [
      de(
        'có Xương Khúc nên hợp chữ nghĩa, học hành và những việc cần trình bày',
        Sac.Thuan,
        76,
        'Xương Khúc',
        'chữ nghĩa',
      ),
      de(
        'thiên về nghĩ và nói nên phần thực hành đôi khi bị bỏ lại',
        Sac.Nghich,
        68,
        'thực hành',
        'bỏ lại',
      ),
    ],
  },
  {
    ten: 'Khôi Việt',
    sao: ['Thiên Khôi', 'Thiên Việt'],
    luan: [
      de('có Khôi Việt nên hay gặp quý nhân đúng lúc cần', Sac.Thuan, 76, 'Khôi Việt', 'quý nhân'),
      de('quen được đỡ nên có lúc chậm tự xoay xở', Sac.Nghich, 66, 'được đỡ', 'tự xoay xở'),
    ],
  },
  {
    ten: 'Tả Hữu',
    sao: ['Tả Phù', 'Hữu Bật'],
    luan: [
      de(
        'có Tả Hữu nên làm việc gì cũng dễ có người phụ giúp',
        Sac.Thuan,
        74,
        'Tả Hữu',
        'phụ giúp',
      ),
      de(
        'việc thường phải làm cùng người khác, một mình thì khó trọn',
        Sac.Nghich,
        66,
        'cùng người khác',
        'một mình',
      ),
    ],
  },
  {
    ten: 'Không Kiếp',
    sao: ['Địa Không', 'Địa Kiếp'],
    luan: [
      de(
        'có Không Kiếp nên dễ hao hụt, gây dựng rồi lại phải dựng lại',
        Sac.Nghich,
        84,
        'Không Kiếp',
        'hao hụt',
      ),
      de(
        'chính cái mất đi lại buộc phải nghĩ khác đi, nên bước sau thường khác hẳn bước trước',
        Sac.HoaGiai,
        70,
        'nghĩ khác',
        'bước sau',
      ),
    ],
  },
  {
    ten: 'Hoả Linh',
    sao: ['Hỏa Tinh', 'Linh Tinh'],
    luan: [
      de(
        'có Hoả Linh nên việc đến nhanh và gấp, ít khi báo trước',
        Sac.Nghich,
        80,
        'Hoả Linh',
        'đến nhanh',
      ),
      de(
        'gặp việc gấp mà quen thì phản ứng cũng nhanh hơn người',
        Sac.Thuan,
        68,
        'phản ứng',
        'nhanh hơn',
      ),
    ],
  },
  {
    ten: 'Kình Đà',
    sao: ['Kình Dương', 'Đà La'],
    luan: [
      de(
        'có Kình Đà nên đường đi nhiều gai, việc gì cũng phải chen mới qua',
        Sac.Nghich,
        82,
        'Kình Đà',
        'nhiều gai',
      ),
      de(
        'quen chen thì cũng dạn, khó khăn về sau không còn làm chùn',
        Sac.HoaGiai,
        68,
        'dạn',
        'chùn',
      ),
    ],
  },
  {
    ten: 'Lộc Mã',
    sao: ['Lộc Tồn', 'Thiên Mã'],
    luan: [
      de(
        'có Lộc Mã giao trì nên tài lộc theo bước chân, càng đi càng có',
        Sac.Thuan,
        82,
        'Lộc Mã',
        'càng đi càng có',
      ),
      de(
        'phải động mới có, ngồi yên thì phần lộc cũng đứng theo',
        Sac.Nghich,
        70,
        'phải động',
        'ngồi yên',
      ),
    ],
  },
];

/** Cách cục đọc từ tam hợp cục của cung: chính cung, hai cung tam hợp và cung xung chiếu. */
export function cachCucTai(chart: NatalChart, chiIndex: number): readonly CachCuc[] {
  const cungTrongCuc = [chiIndex, ...tamHopIndexes(chiIndex), xungChieuIndex(chiIndex)];
  const chinhTinh = new Set<string>();
  const phuTinh = new Set<string>();

  for (const index of cungTrongCuc) {
    for (const sao of chart.cungs[index].chinhTinh) chinhTinh.add(sao.name);
    for (const sao of chart.cungs[index].phuTinh) phuTinh.add(sao.name);
  }

  const nhom = NHOM_CHINH_TINH.filter(
    (mot) => mot.sao.filter((sao) => chinhTinh.has(sao)).length >= mot.nguong,
  );
  const cap = CAP_PHU_TINH.filter((mot) => mot.sao.every((sao) => phuTinh.has(sao)));

  return [...nhom, ...cap].map((mot) => ({ ten: mot.ten, luan: mot.luan }));
}
