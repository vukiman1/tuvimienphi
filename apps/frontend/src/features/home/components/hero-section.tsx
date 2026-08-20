import { HeroBirthForm } from '@/features/home/components/hero-birth-form';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { MEDIA } from '@/config/media';

const HERO_TITLE_ID = 'home-hero-title';

export const HERO_SECTION_ID = 'lap-la-so';

const BACKDROP_CLASS = 'absolute inset-0 h-full w-full object-cover';

const PANEL_GRADIENT = 'linear-gradient(160deg, #55351c 0%, #3a2416 45%, #2a1a0e 100%)';

export function HeroSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

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
        <video
          aria-hidden
          autoPlay
          className={BACKDROP_CLASS}
          loop
          muted
          playsInline
          poster={MEDIA.home.heroPoster}
          preload="auto"
          src={MEDIA.home.heroVideo}
        />
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
          style={{ backgroundImage: PANEL_GRADIENT }}
        >
          <div className="rounded-xl border border-[#c9a15c]/45 px-4 py-5 text-left md:px-6 md:py-6">
            <HeroBirthForm />
          </div>
        </div>
      </div>
    </section>
  );
}
