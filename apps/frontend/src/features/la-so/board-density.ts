import type { PhuTinhName } from '@org/shared-tu-vi';
import type { CungView, SaoView } from '@/features/la-so/chart-types';

export enum BoardDensity {
  Key = 'gon',
  All = 'du',
}

export const KEY_PHU_TINH: ReadonlySet<PhuTinhName> = new Set([
  'Tả Phù',
  'Hữu Bật',
  'Văn Xương',
  'Văn Khúc',
  'Thiên Khôi',
  'Thiên Việt',
  'Kình Dương',
  'Đà La',
  'Hỏa Tinh',
  'Linh Tinh',
  'Địa Không',
  'Địa Kiếp',
  'Hóa Lộc',
  'Hóa Quyền',
  'Hóa Khoa',
  'Hóa Kỵ',
  'Lộc Tồn',
  'Thiên Mã',
] as const satisfies readonly PhuTinhName[]);

function onlyKeyStars(stars: readonly SaoView[]): readonly SaoView[] {
  return stars.filter((star) => KEY_PHU_TINH.has(star.name));
}

export function cungForDensity(cung: CungView, density: BoardDensity): CungView {
  if (density === BoardDensity.All) return cung;
  return {
    ...cung,
    catTinh: onlyKeyStars(cung.catTinh),
    hungTinh: onlyKeyStars(cung.hungTinh),
    luuTinh: onlyKeyStars(cung.luuTinh),
    daiVanTinh: onlyKeyStars(cung.daiVanTinh),
  };
}
