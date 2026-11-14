import type { ReactElement } from 'react';
import { PAINTING_WIDTH, type PagePainting } from '@/design-system';
import { cn } from '@/lib/utils';

interface BandPaintingProps {
  readonly painting: PagePainting;
  readonly className?: string;
}

export function BandPainting({ painting, className }: BandPaintingProps): ReactElement {
  return (
    <img
      alt=""
      decoding="async"
      fetchPriority="low"
      loading="lazy"
      sizes="100vw"
      src={painting.large}
      srcSet={`${painting.small} ${PAINTING_WIDTH.small}w, ${painting.large} ${PAINTING_WIDTH.large}w`}
      className={cn(
        'pointer-events-none absolute inset-0 hidden size-full object-cover md:block',
        className,
      )}
    />
  );
}
