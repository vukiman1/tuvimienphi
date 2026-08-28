import type { CSSProperties } from 'react';

// Scattered across the upper sky and right edge so the twinkle never sits over the title/search.
const STARS: readonly {
  readonly top: string;
  readonly left: string;
  readonly size: number;
  readonly dur: string;
  readonly delay: string;
}[] = [
  { top: '9%', left: '22%', size: 3, dur: '3.4s', delay: '0s' },
  { top: '6%', left: '38%', size: 2, dur: '4.2s', delay: '0.7s' },
  { top: '10%', left: '52%', size: 3, dur: '3.8s', delay: '1.2s' },
  { top: '7%', left: '66%', size: 2, dur: '4.6s', delay: '0.3s' },
  { top: '15%', left: '60%', size: 2, dur: '3.2s', delay: '0.9s' },
  { top: '13%', left: '78%', size: 3, dur: '4s', delay: '1.5s' },
  { top: '22%', left: '70%', size: 2, dur: '3.6s', delay: '0.4s' },
  { top: '8%', left: '87%', size: 2, dur: '4.4s', delay: '0.9s' },
  { top: '26%', left: '84%', size: 3, dur: '3.9s', delay: '1.3s' },
  { top: '18%', left: '92%', size: 2, dur: '4.1s', delay: '0.2s' },
];

/**
 * A faint field of Tử Vi (紫微 — "purple star") stars breathing in the hero sky. Decorative only,
 * desktop-only, and frozen under prefers-reduced-motion via the `.kt-twinkle` CSS rule.
 */
export function HeroStars() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      {STARS.map((star) => (
        <span
          key={`${star.top}-${star.left}`}
          className="kt-twinkle absolute rounded-full bg-[#c9a15c]"
          style={
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              boxShadow: '0 0 6px 1px rgba(201, 161, 92, 0.55)',
              '--kt-tw': star.dur,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
