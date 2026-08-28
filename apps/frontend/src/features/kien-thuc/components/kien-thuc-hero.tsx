import { Search } from 'lucide-react';
import type { CSSProperties, FormEvent } from 'react';
import { MEDIA } from '@/config/media';
import { useHeroParallax } from '@/hooks/use-hero-parallax';
import { HeroBirds } from '@/features/kien-thuc/components/hero-birds';
import { HeroStars } from '@/features/kien-thuc/components/hero-stars';

/** Pointer-driven drift: `factor` px of travel per unit of the --kt-mx / --kt-my mouse offset. */
function parallax(x: number, y: number): CSSProperties {
  return {
    transform: `translate3d(calc(var(--kt-mx, 0) * ${x}px), calc(var(--kt-my, 0) * ${y}px), 0)`,
  };
}

interface KienThucHeroProps {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
}

// White-background ink paintings; `mix-blend-multiply` drops the white so only the wash sits on the
// parchment.
const INK = 'pointer-events-none absolute bottom-0 object-contain object-bottom mix-blend-multiply';

/**
 * The page banner: ink-wash peaks framing both sides, a crane over sun and cloud on the right and a
 * faint la bàn watermark, with the title, pitch and a single-pill article search over the top.
 */
export function KienThucHero({ query, onQueryChange }: KienThucHeroProps) {
  const parallaxRef = useHeroParallax<HTMLElement>();

  function handleSubmit(event: FormEvent) {
    // Search filters live as you type; the form exists only so Enter doesn't reload the page.
    event.preventDefault();
  }

  return (
    <section
      ref={parallaxRef}
      className="relative overflow-hidden border-b border-[#e7d9bf] bg-[#f5ecd9]"
    >
      {/* The compass of fate — a faint la bàn turning very slowly behind the title. */}
      <img
        src={MEDIA.laSo.luopan}
        alt=""
        aria-hidden
        className="kt-spin pointer-events-none absolute -top-28 left-1/2 -ml-[13rem] hidden size-[26rem] opacity-[0.24] md:block"
      />
      {/* Peaks and pine climbing the left edge. */}
      <img
        src={MEDIA.laSo.decorLeft}
        alt=""
        aria-hidden
        style={parallax(3, 0)}
        className={`${INK} kt-parallax left-0 h-[96%] w-auto max-w-[42%] opacity-80 [mask-image:linear-gradient(to_right,#000_55%,transparent)]`}
      />
      {/* Peaks climbing the right edge, behind the crane. */}
      <img
        src={MEDIA.laSo.decorRight}
        alt=""
        aria-hidden
        style={parallax(4, 0)}
        className={`${INK} kt-parallax right-0 hidden h-[92%] w-auto max-w-[36%] opacity-70 [mask-image:linear-gradient(to_left,#000_55%,transparent)] md:block`}
      />
      {/* Crane in flight over sun and cloud — the focal artwork: gentle float + stronger parallax. */}
      <div
        aria-hidden
        style={parallax(9, 5)}
        className="kt-parallax pointer-events-none absolute -top-2 right-0 w-[46%] max-w-[560px] sm:w-[40%]"
      >
        <img src={MEDIA.ngayTot.decorCrane} alt="" className="kt-float w-full object-contain" />
      </div>
      {/* A small flock drifting across the sky, and a field of faint Tử Vi stars. */}
      <HeroBirds />
      <HeroStars />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-28 md:px-6 md:pt-16 md:pb-32">
        <div className="mx-auto max-w-2xl animate-in text-center duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
          <h1 className="font-display text-[32px] font-bold tracking-wide text-[#7a1f15] uppercase md:text-[42px]">
            Kiến thức tử vi
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-relaxed text-[#6b5b44] md:text-[15px]">
            Kho tàng tri thức giúp bạn hiểu sâu hơn về tử vi,
            <br />
            hệ thống sao, cung số và ứng dụng trong cuộc sống.
          </p>

          {/* Two separate pills — a white search field and a cinnabar D-shaped button, matching the
              design's split control. */}
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-[460px] items-stretch">
            <div className="flex h-12 flex-1 items-center gap-2.5 rounded-full bg-white px-4 shadow-[0_8px_24px_rgba(60,40,15,0.12)]">
              <Search aria-hidden className="size-5 shrink-0 text-[#8d7a5c]" />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Tìm kiếm bài viết..."
                aria-label="Tìm kiếm bài viết"
                className="h-full flex-1 bg-transparent text-[15px] text-[#2a1f0e] outline-none placeholder:text-[#9c8a70]"
              />
            </div>
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="relative z-10 -ml-7 flex h-12 w-16 shrink-0 items-center justify-center rounded-l-2xl rounded-r-full bg-[#9e2b1e] text-[#fdf3dc] shadow-[0_8px_24px_rgba(60,40,15,0.12)] transition-colors hover:bg-[#8a2318] focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none"
            >
              <Search className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
