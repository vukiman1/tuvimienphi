import { conGiapSlug } from '@org/shared-tu-vi';
import { MEDIA, conGiapEmblemUrl, conGiapPaintingUrl } from '@/config/media';
import { PAINTING_WIDTH, type PagePainting } from '@/design-system';

export const TET_EVE_PAINTING: PagePainting = {
  small: MEDIA.tetHub.nightSmall,
  large: MEDIA.tetHub.nightLarge,
};

export function conGiapPainting(chi: number): PagePainting {
  const slug = conGiapSlug(chi);
  return {
    small: conGiapPaintingUrl(slug, PAINTING_WIDTH.small),
    large: conGiapPaintingUrl(slug, PAINTING_WIDTH.large),
  };
}

export function conGiapEmblem(chi: number): string {
  return conGiapEmblemUrl(conGiapSlug(chi));
}
