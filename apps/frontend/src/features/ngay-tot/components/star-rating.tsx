import type { ReactElement } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_RATING = 5;

interface StarRatingProps {
  readonly rating: number;
  readonly className?: string;
}

export function StarRating({ rating, className }: StarRatingProps): ReactElement {
  return (
    <span
      aria-label={`${rating} trên ${MAX_RATING} sao`}
      className={cn('flex items-center gap-0.5', className)}
      role="img"
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          aria-hidden
          className={cn(
            'size-3.5',
            index < rating ? 'fill-gold text-ink' : 'fill-transparent text-ink-soft',
          )}
          key={index}
        />
      ))}
    </span>
  );
}
