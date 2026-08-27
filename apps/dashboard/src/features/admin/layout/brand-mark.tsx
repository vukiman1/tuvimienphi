import { cn } from '@/lib/utils';

/** A celestial sigil — a four-point star (sparkle) inside an orbital ring dotted with constellation
 *  points. Reads as "thiên văn" (astronomy / star-reading) rather than a generic logo. */
export function BrandMark({ className }: { className?: string }) {
  const orbit = Array.from({ length: 8 });
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('size-full', className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* Constellation points around the orbit. */}
      {orbit.map((_, i) => {
        const a = (i * Math.PI) / 4;
        const cx = 50 + Math.cos(a) * 44;
        const cy = 50 + Math.sin(a) * 44;
        return <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 2.4 : 1.4} fill="currentColor" />;
      })}
      {/* Central sparkle: two crossed four-point stars. */}
      <path d="M50 18 L55 45 L82 50 L55 55 L50 82 L45 55 L18 50 L45 45 Z" fill="currentColor" />
      <circle cx="50" cy="50" r="3.2" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
