import type { CSSProperties } from 'react';

/** A single gull silhouette — a shallow double-curve, wings flapping via the `kt-bird` class. */
function Gull({ size, style }: { readonly size: number; readonly style: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size * 0.42}
      viewBox="0 0 24 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden
      className="kt-bird absolute"
      style={style}
    >
      <path d="M2 7Q7 2 12 7 17 2 22 7" />
    </svg>
  );
}

// An echelon trailing down-left from the leader (front, top-right), matching the up-right flight.
const BIRDS: readonly {
  readonly top: number;
  readonly left: number;
  readonly size: number;
  readonly delay: string;
}[] = [
  { top: 0, left: 120, size: 32, delay: '0ms' },
  { top: 16, left: 90, size: 28, delay: '90ms' },
  { top: 32, left: 62, size: 26, delay: '180ms' },
  { top: 48, left: 34, size: 22, delay: '120ms' },
  { top: 62, left: 8, size: 20, delay: '210ms' },
];

/**
 * A flock of ink birds drifting across the hero sky. Decorative only, hidden on small screens and
 * frozen under prefers-reduced-motion (handled in CSS via `.kt-flock` / `.kt-bird`).
 */
export function HeroBirds() {
  return (
    <div
      aria-hidden
      className="kt-flock pointer-events-none absolute top-[14%] left-0 hidden h-[96px] w-[160px] text-[#5a4326]/55 md:block"
    >
      {BIRDS.map((bird) => (
        <Gull
          key={`${bird.top}-${bird.left}`}
          size={bird.size}
          style={{ top: bird.top, left: bird.left, animationDelay: bird.delay }}
        />
      ))}
    </div>
  );
}
