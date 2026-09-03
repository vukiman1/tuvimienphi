import { useState } from 'react';
import { BadgeCheck, LayoutGrid, ShieldCheck, Sparkles } from 'lucide-react';
import { BirthForm } from '@/features/la-so/components/birth-form';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { MEDIA } from '@/config/media';

const HERO_TITLE_ID = 'home-hero-title';

export const HERO_SECTION_ID = 'lap-la-so';

const BACKDROP_CLASS = 'absolute inset-0 h-full w-full object-cover';

/**
 * Bốn lời cam kết dưới form. Icon để thẳng dạng component vì đây là danh sách cố định trong chính
 * file này, không phải dữ liệu backend trả về.
 */
const HERO_ASSURANCES = [
  { label: 'Chính xác & khoa học', Icon: BadgeCheck },
  { label: 'Dễ hiểu & trực quan', Icon: LayoutGrid },
  { label: 'Bảo mật thông tin', Icon: ShieldCheck },
  { label: 'Miễn phí trọn đời', Icon: Sparkles },
] as const;

/** Hai bản dựng hero đang cân nhắc; nút đổi bên dưới để xem thẳng trên trang thay vì sửa code. */
const HERO_VIDEOS = [
  { key: 'nhe-nhang', label: 'Bản mới', src: MEDIA.home.heroVideoCalm },
  { key: 'goc', label: 'Bản cũ', src: MEDIA.home.heroVideo },
] as const;

/**
 * Vân gỗ thật thay cho gradient. Dùng `cover` chứ không lặp: khung này rộng tối đa 680px còn ảnh
 * 1240px, nên phủ một lần là đủ và không lộ đường nối. Màu nền giữ lại làm lớp đỡ khi ảnh chưa về.
 */
const PANEL_WOOD = {
  backgroundImage: `url('${MEDIA.home.woodPanel}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#2a1a0e',
} as const;

export function HeroSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoIndex, setVideoIndex] = useState(0);
  const video = HERO_VIDEOS[videoIndex];

  return (
    <section
      aria-labelledby={HERO_TITLE_ID}
      id={HERO_SECTION_ID}
      className="relative flex min-h-[calc(100svh_-_var(--site-header-height))] items-center overflow-hidden bg-[#2a1a0e]"
    >
      {prefersReducedMotion ? (
        <img
          alt=""
          aria-hidden
          className={BACKDROP_CLASS}
          fetchPriority="high"
          src={MEDIA.home.heroPoster}
        />
      ) : (
        // Khoá theo `src`: đổi thuộc tính src trên thẻ video đang chạy thì trình duyệt không tự nạp
        // lại, phải gọi load() bằng tay. Dựng lại thẻ đơn giản hơn và không phải giữ ref.
        <video
          key={video.src}
          aria-hidden
          autoPlay
          className={BACKDROP_CLASS}
          loop
          muted
          playsInline
          poster={MEDIA.home.heroPoster}
          preload="auto"
          src={video.src}
        />
      )}

      {!prefersReducedMotion && (
        // Nép trái: góc phải dưới là chỗ các widget chat hay neo vào, để đây thì sau này chồng nhau.
        <button
          aria-label={`Đổi video nền, đang dùng ${video.label}`}
          className="absolute bottom-3 left-3 z-20 rounded-full border border-[#c9a15c]/60 bg-black/55 px-3 py-1.5 text-xs font-medium text-[#f3e6cd] backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none md:bottom-5 md:left-5"
          onClick={() => setVideoIndex((current) => (current + 1) % HERO_VIDEOS.length)}
          title={`Đang dùng ${video.label}`}
          type="button"
        >
          Background
        </button>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,15,6,0.5)_0%,rgba(26,15,6,0.16)_42%,rgba(26,15,6,0.5)_100%)]"
      />
      {/* Pooled behind the title only: the artwork is brightest exactly where the heading sits. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_46%_26%_at_50%_25%,rgba(26,15,6,0.66)_0%,transparent_78%)]"
      />

      <div className="relative mx-auto w-full max-w-[920px] px-4 py-12 text-center md:px-6 md:py-16">
        <h1
          className="bg-gradient-to-b from-[#fffaf0] via-[#f6e3b6] to-[#d9b063] bg-clip-text font-display text-4xl font-bold tracking-wide text-transparent uppercase [filter:drop-shadow(0_1px_2px_rgba(26,15,6,0.8))_drop-shadow(0_2px_8px_rgba(26,15,6,0.55))] sm:text-5xl md:text-6xl"
          id={HERO_TITLE_ID}
        >
          Lập lá số tử vi
        </h1>

        <p className="mt-4 text-base text-[#f3e6cd] [filter:drop-shadow(0_1px_2px_rgba(26,15,6,0.9))_drop-shadow(0_0_14px_rgba(26,15,6,0.7))] md:text-lg">
          Khám phá bản mệnh, định hướng tương lai qua khoa học Tử Vi.
        </p>

        <div
          className="mx-auto mt-8 max-w-[680px] rounded-2xl border-2 border-[#c9a15c]/80 p-1.5 shadow-2xl md:mt-10"
          style={PANEL_WOOD}
        >
          <div className="rounded-xl border border-[#c9a15c]/45 px-4 py-5 text-left md:px-6 md:py-6">
            <BirthForm />
          </div>
        </div>

        <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-[12px] gap-y-[10px] md:mt-8">
          {HERO_ASSURANCES.map(({ label, Icon }, index) => (
            <li className="contents" key={label}>
              {/* Gạch nối chỉ hiện khi cả bốn nằm trên một hàng; xuống dòng rồi thì nó lạc lõng. */}
              {index > 0 && (
                <span aria-hidden className="hidden h-px w-[14px] bg-[#c9a15c]/35 lg:block" />
              )}
              <span className="inline-flex items-center gap-[9px] rounded-full border border-[#c9a15c]/45 bg-black/30 py-[7px] pr-[16px] pl-[7px] backdrop-blur-[2px]">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#c9a15c]/70 text-[#e8c887]">
                  {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-4` thành 22px, tràn khỏi vòng tròn. */}
                  <Icon aria-hidden className="size-[15px]" />
                </span>
                <span className="text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#f3e6cd]">
                  {label}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
