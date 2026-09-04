import type { CanChiIndex } from '@/lib/lunar-calendar';
import { CHI_COUNT, mod12 } from '@/lib/tu-vi/chi';

/** Tuần và Triệt đều chắn đúng hai cung liền nhau, nên luôn trả về một cặp chi. */
export type BlockedPair = readonly [number, number];

const CAN_COUNT = 10;

/**
 * Tuần không: mỗi tuần giáp có sáu mươi ngày phủ mười can nhưng mười hai chi, nên luôn thừa ra hai
 * chi không có can nào đi kèm — chính hai chi đó bị Tuần chắn.
 */
export function anTuan(yearPillar: CanChiIndex): BlockedPair {
  const stepsFromGiap = mod12(yearPillar.chi - yearPillar.can);
  const first = (stepsFromGiap + CAN_COUNT) % CHI_COUNT;
  return [first, (first + 1) % CHI_COUNT];
}

/**
 * Triệt lộ tra theo can năm, năm cặp lặp lại hai lần. Giáp/Kỷ chắn Thân – Dậu, Ất/Canh chắn
 * Ngọ – Mùi, Bính/Tân chắn Thìn – Tị, Đinh/Nhâm chắn Dần – Mão, Mậu/Quý chắn Tý – Sửu.
 */
const TRIET_FIRST_CHI = [8, 6, 4, 2, 0] as const;

export function anTriet(yearCan: number): BlockedPair {
  const first = TRIET_FIRST_CHI[yearCan % 5];
  return [first, first + 1];
}
