import type { PhuTinhName } from './sao-names.js';

/**
 * Phụ tinh xếp vào nhóm hung. Sao nào không nằm trong danh sách này được coi là cát hoặc trung
 * tính — không có nhóm thứ ba, nên mọi nơi cần phân loại đều hỏi qua `isHungTinh`.
 */
export const HUNG_TINH_NAMES = [
  'Kình Dương',
  'Đà La',
  'Hỏa Tinh',
  'Linh Tinh',
  'Địa Không',
  'Địa Kiếp',
  'Thiên Hình',
  'Thiên Diêu',
  'Thiên Khốc',
  'Thiên Hư',
  'Đại Hao',
  'Tiểu Hao',
  'Bạch Hổ',
  'Tang Môn',
  'Điếu Khách',
  'Tuế Phá',
  'Kiếp Sát',
  'Cô Thần',
  'Quả Tú',
  'Phá Toái',
  'Thiên Thương',
  'Thiên Sứ',
  'Thiên Không',
  'Hóa Kỵ',
  'Bệnh Phù',
  'Quan Phù',
  'Phục Binh',
] as const satisfies readonly PhuTinhName[];

const HUNG_TINH: ReadonlySet<PhuTinhName> = new Set(HUNG_TINH_NAMES);

export function isHungTinh(name: PhuTinhName): boolean {
  return HUNG_TINH.has(name);
}
