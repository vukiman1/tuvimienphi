import { MEDIA } from '@/config/media';

/** Hoa văn khung trang lịch sử: hai vế đối xứng quanh tiêu đề, dải sóng khép chân trang. */

/**
 * `object-cover`, không phải `contain`: ảnh gốc tỉ lệ 3:1 với rất nhiều khoảng trống trên dưới, nên
 * `contain` trong một khung dẹt sẽ co cả hoa văn lại thành sợi chỉ. `cover` xén phần trống đi và
 * giữ nguyên độ dày của nét vàng.
 */
/** Ẩn dưới `sm`: ở đó tiêu đề xuống hai dòng và hoa văn hoá ra lửng lơ cạnh khối chữ. */
const ORNAMENT_CLASS = 'hidden h-5 w-20 shrink-0 object-cover sm:block md:w-24';

export function TitleFlourish({ facing }: { facing: 'left' | 'right' }) {
  return (
    <img
      alt=""
      aria-hidden
      className={ORNAMENT_CLASS}
      src={MEDIA.laSo.headerOrnament}
      style={facing === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    />
  );
}

/**
 * Vẽ bằng SVG chứ không dùng ảnh: dải này chỉ là hai đường cong, ra ảnh raster thì vừa nặng vừa
 * rỗ ở màn hình mật độ cao, mà lại không đổi màu theo nền được.
 */
export function GoldWave() {
  return (
    <svg
      aria-hidden
      className="h-10 w-full text-[#c9a15c]"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 1200 40"
    >
      <path d="M0 30C200 30 280 6 600 6s400 24 600 24" stroke="currentColor" strokeWidth="2" />
      <path
        d="M0 36C200 36 280 12 600 12s400 24 600 24"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
    </svg>
  );
}
