import type { ReactElement } from 'react';
import { PAINTING_WIDTH } from '@/design-system';
import { cn } from '@/lib/utils';
import { KIEN_THUC_PAINTING } from '../kien-thuc-media';

interface KienThucPaintingProps {
  readonly focusClassName: string;
  readonly veilClassName: string;
}

export function KienThucPainting({
  focusClassName,
  veilClassName,
}: KienThucPaintingProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-clip md:block"
    >
      <img
        alt=""
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        sizes="100vw"
        src={KIEN_THUC_PAINTING.large}
        srcSet={`${KIEN_THUC_PAINTING.small} ${PAINTING_WIDTH.small}w, ${KIEN_THUC_PAINTING.large} ${PAINTING_WIDTH.large}w`}
        className={cn('size-full object-cover', focusClassName)}
      />
      <div className={cn('absolute inset-0', veilClassName)} />
    </div>
  );
}
