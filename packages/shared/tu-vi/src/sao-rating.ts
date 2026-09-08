/**
 * Bậc của một sao tại một cung: Miếu, Vượng, Đắc, Bình, Hãm — viết tắt đúng như trên lá số.
 *
 * Viết thành union chứ không phải enum để hai bảng tra giữ được dạng lưới đọc bằng mắt, vốn là thứ
 * duy nhất cho phép đối chiếu tay với sách. Cùng khuôn với `NguHanh` trong `nap-am.ts`.
 */
export type Rating = 'M' | 'V' | 'Đ' | 'B' | 'H';
