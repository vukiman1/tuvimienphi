import type { CanChiIndex } from '@/lib/lunar-calendar';
import { CHI_COUNT } from '@/lib/tu-vi/chi';
import {
  CAN_LUONG_DAY,
  CAN_LUONG_HOUR,
  CAN_LUONG_MONTH,
  CAN_LUONG_YEAR,
} from '@/lib/tu-vi/can-luong-data';

/** Xưng cốt ca: cân số mệnh bằng cách cộng bốn trọng lượng của năm, tháng, ngày và giờ sinh. */

const CHI_PER_LUONG = 10;
const SEXAGENARY_CYCLE = 60;
const CAN_COUNT = 10;

/** Vị trí của một cặp can chi trong lục thập hoa giáp. */
function sexagenaryIndex(pillar: CanChiIndex): number {
  for (let index = 0; index < SEXAGENARY_CYCLE; index += 1) {
    if (index % CAN_COUNT === pillar.can && index % CHI_COUNT === pillar.chi) {
      return index;
    }
  }
  throw new Error(
    `Cặp can chi không có trong lục thập hoa giáp: can ${pillar.can} chi ${pillar.chi}`,
  );
}

export interface CanLuongParams {
  readonly yearPillar: CanChiIndex;
  /** Tháng âm, 1–12. */
  readonly lunarMonth: number;
  /** Ngày âm, 1–30. */
  readonly lunarDay: number;
  readonly hourChi: number;
}

/** Tổng trọng lượng, đơn vị chỉ. */
export function anCanLuong(params: CanLuongParams): number {
  return (
    CAN_LUONG_YEAR[sexagenaryIndex(params.yearPillar)] +
    CAN_LUONG_MONTH[params.lunarMonth - 1] +
    CAN_LUONG_DAY[params.lunarDay - 1] +
    CAN_LUONG_HOUR[params.hourChi]
  );
}

/** Đọc thành chữ như trên lá số: "4 lượng 2 chỉ", bỏ phần chỉ khi tròn lượng. */
export function formatCanLuong(total: number): string {
  const luong = Math.floor(total / CHI_PER_LUONG);
  const chi = total % CHI_PER_LUONG;
  return chi === 0 ? `${luong} lượng` : `${luong} lượng ${chi} chỉ`;
}
