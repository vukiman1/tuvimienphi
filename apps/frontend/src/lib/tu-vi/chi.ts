/** Mười hai địa chi, đánh số 0 = Tý. */
export const CHI_COUNT = 12;

/** Đếm vòng trên địa bàn: kết quả luôn rơi vào 0–11, kể cả khi đếm nghịch qua Tý. */
export function mod12(value: number): number {
  return ((value % CHI_COUNT) + CHI_COUNT) % CHI_COUNT;
}
