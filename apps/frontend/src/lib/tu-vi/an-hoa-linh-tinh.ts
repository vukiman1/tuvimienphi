import { mod12 } from '@/lib/tu-vi/chi';
import type { PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';

/**
 * Hỏa Tinh và Linh Tinh. Tách riêng khỏi `an-phu-tinh.ts` vì hai sao này là cặp duy nhất cần cả
 * nhóm tam hợp của chi năm lẫn giờ sinh lẫn chiều âm dương nam nữ — tra bảng một chiều không đủ.
 *
 * Luật đối chiếu khớp 66/66 lượt trên 33 lá số trong `tuvi-vn-charts.fixture.ts`.
 */

/** Nhóm tam hợp của chi năm sinh, quyết định cung khởi. */
enum TamHop {
  DanNgoTuat = 'DanNgoTuat',
  ThanTyThin = 'ThanTyThin',
  TiDauSuu = 'TiDauSuu',
  HoiMaoMui = 'HoiMaoMui',
}

const TAM_HOP_BY_YEAR_CHI: readonly TamHop[] = [
  TamHop.ThanTyThin, // Tý
  TamHop.TiDauSuu, // Sửu
  TamHop.DanNgoTuat, // Dần
  TamHop.HoiMaoMui, // Mão
  TamHop.ThanTyThin, // Thìn
  TamHop.TiDauSuu, // Tị
  TamHop.DanNgoTuat, // Ngọ
  TamHop.HoiMaoMui, // Mùi
  TamHop.ThanTyThin, // Thân
  TamHop.TiDauSuu, // Dậu
  TamHop.DanNgoTuat, // Tuất
  TamHop.HoiMaoMui, // Hợi
];

const HOA_TINH_START: Readonly<Record<TamHop, number>> = {
  [TamHop.DanNgoTuat]: 1, // Sửu
  [TamHop.ThanTyThin]: 2, // Dần
  [TamHop.TiDauSuu]: 3, // Mão
  [TamHop.HoiMaoMui]: 9, // Dậu
};

const LINH_TINH_START: Readonly<Record<TamHop, number>> = {
  [TamHop.DanNgoTuat]: 3, // Mão
  [TamHop.ThanTyThin]: 10, // Tuất
  [TamHop.TiDauSuu]: 10, // Tuất
  [TamHop.HoiMaoMui]: 10, // Tuất
};

export interface HoaLinhParams {
  readonly yearChi: number;
  readonly hourChi: number;
  /** Dương Nam và Âm Nữ đi thuận — cùng chiều với đại vận. */
  readonly isForward: boolean;
}

/** Từ cung khởi của nhóm, đếm số bước bằng chi giờ sinh. Linh Tinh luôn đi ngược chiều Hỏa Tinh. */
export function anHoaLinhTinh(params: HoaLinhParams): readonly SaoPlacement<PhuTinhName>[] {
  const group = TAM_HOP_BY_YEAR_CHI[params.yearChi];
  const step = params.isForward ? 1 : -1;

  return [
    { name: 'Hỏa Tinh', chiIndex: mod12(HOA_TINH_START[group] + step * params.hourChi) },
    { name: 'Linh Tinh', chiIndex: mod12(LINH_TINH_START[group] - step * params.hourChi) },
  ];
}
