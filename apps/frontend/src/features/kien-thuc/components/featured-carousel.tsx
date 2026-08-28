import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, CalendarDays, Eye } from 'lucide-react';
import {
  type Article,
  categoryLabel,
  formatArticleDate,
  formatViews,
} from '@/features/kien-thuc/kien-thuc-data';
import { CarouselIndicator } from '@/features/kien-thuc/components/carousel-indicator';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

interface FeaturedCarouselProps {
  readonly articles: readonly Article[];
}

/**
 * The featured carousel. All slides sit side by side on one flex track; advancing slides the track
 * left so the next article glides in from the right while the previous one recedes (shrinks + dims)
 * to make way. A clone of the first slide is appended so the loop from last→first keeps moving left
 * instead of sweeping backwards — once it lands on the clone we snap back to the real first slide
 * with the transition off, which is invisible because they're identical.
 *
 * Remount (via a `key` on the pool) to reset when the filter/search result set changes.
 */
export function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
  const count = articles.length;
  const reducedMotion = usePrefersReducedMotion();
  const [pos, setPos] = useState(0); // 0..count — index `count` is the appended clone of slide 0
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  // Auto-advance every 5s; paused on hover and under reduced motion.
  useEffect(() => {
    if (paused || reducedMotion || count <= 1) return;
    const id = setInterval(() => setPos((current) => current + 1), 5000);
    return () => clearInterval(id);
  }, [paused, reducedMotion, count]);

  // After the track lands on the clone, jump back to the real first slide with no animation.
  useEffect(() => {
    if (pos !== count || count <= 1) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setPos(0);
    }, 700);
    return () => clearTimeout(id);
  }, [pos, count]);

  // Re-enable the transition on the next frame after any instant snap.
  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const glide = animate && !reducedMotion;
  const activeDot = pos % count;
  const slides = count > 1 ? [...articles, articles[0]] : articles;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden">
        <div
          className={cn('flex', glide && 'transition-transform duration-700 ease-out')}
          style={{ transform: `translateX(-${pos * 100}%)` }}
        >
          {slides.map((article, index) => (
            <div key={index} className="w-full shrink-0 px-1 pt-1 pb-2">
              <div
                className={cn(
                  'origin-center',
                  glide && 'transition-[transform,opacity] duration-700 ease-out',
                  index === pos ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-40',
                )}
              >
                <FeaturedSlide article={article} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots centred beneath the artwork, as in the design. */}
      <div className="mt-4 flex justify-center md:w-[52%]">
        <CarouselIndicator count={count} active={activeDot} onSelect={setPos} />
      </div>
    </div>
  );
}

/** One featured slide: artwork on the left overlapping a cream card with the headline and CTA. */
function FeaturedSlide({ article }: { readonly article: Article }) {
  return (
    <article className="group/feat relative flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1 md:flex-row md:items-center">
      <div className="relative z-10 aspect-[16/11] overflow-hidden rounded-2xl bg-[#efe4cd] shadow-[0_16px_40px_rgba(60,25,10,0.22)] transition-shadow duration-300 group-hover/feat:shadow-[0_22px_52px_rgba(60,25,10,0.28)] md:aspect-[4/3] md:-mr-8 md:w-[50%] md:shrink-0">
        <Link to="/kien-thuc/$slug" params={{ slug: article.slug }} className="block h-full w-full">
          <img
            src={article.thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover/feat:scale-[1.03]"
          />
        </Link>
      </div>

      <div className="relative -mt-6 flex flex-1 flex-col justify-center rounded-2xl border border-[#e7d9bf] bg-card px-6 py-6 md:mt-0 md:min-h-[320px] md:pr-8 md:pl-14">
        <span aria-hidden className="kt-aura pointer-events-none absolute inset-0 rounded-2xl" />
        <div className="relative">
          <span className="w-fit rounded-full bg-[#f0e2c8] px-3 py-1 text-[12px] font-bold tracking-wide text-[#8a5a1f] uppercase">
            {categoryLabel(article.category)}
          </span>
          <h3 className="mt-4 font-display text-[22px] font-bold leading-snug text-[#2a1f0e] uppercase md:text-[26px]">
            <Link
              to="/kien-thuc/$slug"
              params={{ slug: article.slug }}
              className="transition-colors hover:text-[#9e2b1e]"
            >
              {article.title}
            </Link>
          </h3>
          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[#6b5b44]">
            {article.excerpt}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[12px] text-[#8d7a5c]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatArticleDate(article.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5" />
                {formatViews(article.views)} lượt xem
              </span>
            </div>
            <Link
              to="/kien-thuc/$slug"
              params={{ slug: article.slug }}
              className="group/cta inline-flex items-center gap-2 rounded-full bg-[#9e2b1e] px-5 py-2.5 text-[11px] font-semibold tracking-wide text-[#fdf3dc] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#8a2318] active:translate-y-0"
            >
              Đọc ngay
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
