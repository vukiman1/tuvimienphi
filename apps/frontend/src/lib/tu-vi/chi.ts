/** Mười hai địa chi, đánh số 0 = Tý. */
export const CHI_COUNT = 12;

/** Đếm vòng trên địa bàn: kết quả luôn rơi vào 0–11, kể cả khi đếm nghịch qua Tý. */
export function mod12(value: number): number {
  return ((value % CHI_COUNT) + CHI_COUNT) % CHI_COUNT;
}

const TAM_HOP_STEPS = [4, 8];
const XUNG_CHIEU_STEP = 6;

/** Hai cung còn lại trong nhóm tam hợp, ví dụ Tý đi cùng Thìn và Thân. */
export function tamHopIndexes(cungIndex: number): readonly number[] {
  return TAM_HOP_STEPS.map((step) => mod12(cungIndex + step));
}

/** Cung đối diện qua tâm địa bàn. Cung vô chính diệu mượn chính tinh từ đây. */
export function xungChieuIndex(cungIndex: number): number {
  return mod12(cungIndex + XUNG_CHIEU_STEP);
}

/**
 * Nhị hợp (lục hợp): sáu cặp Tý–Sửu, Dần–Hợi, Mão–Tuất, Thìn–Dậu, Tị–Thân, Ngọ–Mùi. Hai chi trong
 * một cặp luôn có tổng chỉ số bằng 1 (tính vòng), nên soi gương qua mốc đó là ra bạn của nó.
 */
const NHI_HOP_MIRROR = 1;

export function nhiHopIndex(cungIndex: number): number {
  return mod12(NHI_HOP_MIRROR - cungIndex);
}
