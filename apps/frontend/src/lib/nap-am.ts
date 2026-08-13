import type { CanChiIndex } from '@/lib/lunar-calendar';

export type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

// The 30 nạp âm names of the sexagenary cycle, in Giáp Tý order. Each entry
// covers two consecutive can-chi pairs; the trailing word is its ngũ hành.
const NAP_AM_NAMES = [
  'Hải Trung Kim',
  'Lô Trung Hỏa',
  'Đại Lâm Mộc',
  'Lộ Bàng Thổ',
  'Kiếm Phong Kim',
  'Sơn Đầu Hỏa',
  'Giản Hạ Thủy',
  'Thành Đầu Thổ',
  'Bạch Lạp Kim',
  'Dương Liễu Mộc',
  'Tuyền Trung Thủy',
  'Ốc Thượng Thổ',
  'Phích Lịch Hỏa',
  'Tùng Bách Mộc',
  'Trường Lưu Thủy',
  'Sa Trung Kim',
  'Sơn Hạ Hỏa',
  'Bình Địa Mộc',
  'Bích Thượng Thổ',
  'Kim Bạc Kim',
  'Phúc Đăng Hỏa',
  'Thiên Hà Thủy',
  'Đại Dịch Thổ',
  'Thoa Xuyến Kim',
  'Tang Chá Mộc',
  'Đại Khê Thủy',
  'Sa Trung Thổ',
  'Thiên Thượng Hỏa',
  'Thạch Lựu Mộc',
  'Đại Hải Thủy',
] as const;

const SEXAGENARY_CYCLE = 60;
const CAN_COUNT = 10;
const CHI_COUNT = 12;

export interface NapAm {
  readonly name: string;
  readonly element: NguHanh;
}

function sexagenaryIndex({ can, chi }: CanChiIndex): number {
  for (let k = can; k < SEXAGENARY_CYCLE; k += CAN_COUNT) {
    if (k % CHI_COUNT === chi) {
      return k;
    }
  }
  throw new Error(`Invalid can-chi pairing: can ${can}, chi ${chi}`);
}

export function getNapAm(pillar: CanChiIndex): NapAm {
  const name = NAP_AM_NAMES[Math.floor(sexagenaryIndex(pillar) / 2)];
  const words = name.split(' ');
  return { name, element: words[words.length - 1] as NguHanh };
}
