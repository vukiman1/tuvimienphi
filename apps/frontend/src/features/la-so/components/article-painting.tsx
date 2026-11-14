import type { CSSProperties, ReactElement } from 'react';
import type { PagePainting } from '@/design-system';
import { LUAN_GIAI_PAINTING_WIDTH } from '@/features/la-so/luan-giai-painting';

const INK_WASH_MASK: CSSProperties = {
  maskImage: 'radial-gradient(ellipse 72% 70% at 50% 46%, black 58%, transparent 100%)',
};

export function ArticlePainting({ painting }: { readonly painting: PagePainting }): ReactElement {
  return (
    <figure
      aria-hidden="true"
      className="pointer-events-none mx-auto mb-2 w-2/3 max-w-60 select-none md:float-right md:mx-0 md:mb-4 md:ml-6 md:w-64 md:max-w-none"
    >
      <img
        alt=""
        className="h-auto w-full"
        decoding="async"
        loading="lazy"
        sizes="(min-width: 48rem) 16rem, 66vw"
        src={painting.small}
        srcSet={`${painting.small} ${LUAN_GIAI_PAINTING_WIDTH.small}w, ${painting.large} ${LUAN_GIAI_PAINTING_WIDTH.large}w`}
        style={INK_WASH_MASK}
      />
    </figure>
  );
}
