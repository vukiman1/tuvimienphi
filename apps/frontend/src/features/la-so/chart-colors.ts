import type { NguHanh } from '@/lib/nap-am';

/**
 * Ba mức nền của lá số, đậm dần: nền mặc định → cung tam hợp / xung chiếu → cung đang rê chuột.
 *
 * Ghi cả tên lớp thay vì chỉ mã màu: Tailwind quét mã nguồn dạng chuỗi, ghép `bg-[${...}]` lúc chạy
 * thì lớp đó không được sinh ra.
 */
export const CUNG_SURFACE_CLASS = {
  base: 'bg-[#faf6ec]',
  related: 'bg-[#f7f0dd]',
  focused: 'bg-[#f6e4bd]',
} as const;

/**
 * Nét kẻ địa bàn dùng tông vàng của site thay cho nét đen: nhẹ mắt hơn trên nền kem và bớt cảm giác
 * bảng biểu. Chọn `#b8894a` chứ không phải vàng nhạt `#c9a15c` vì lưới ở đây gánh vai trò cấu trúc —
 * nhạt quá thì 12 ô nhoè vào nhau.
 */
export const CHART_RULE_CLASS = {
  border: 'border-[#b8894a]',
  fill: 'bg-[#b8894a]',
  /** Nhãn Tuần / Triệt giữ nền đen: nó đè lên nét kẻ nên cần bật hẳn ra, và chữ trắng mới đọc rõ. */
  blockLabel: 'bg-[#17150f]',
} as const;

/**
 * Màu chữ của sao theo ngũ hành, hạ độ chói so với bản gốc tuvi.vn để đọc được trên nền kem
 * `#faf6ec`. Kim phải đậm hơn mã gốc `#999999`, nếu không sao Kim chìm hẳn vào nền; Thổ ngả đồng
 * cho ăn với nét kẻ địa bàn.
 */
export const SAO_ELEMENT_CLASS: Readonly<Record<NguHanh, string>> = {
  Kim: 'text-[#8a8578]',
  Mộc: 'text-[#0b7a33]',
  Thủy: 'text-[#17150f]',
  Hỏa: 'text-[#c62828]',
  Thổ: 'text-[#b8860b]',
};
