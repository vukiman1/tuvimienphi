import { CUNG_NAMES } from '@org/shared-tu-vi';
import type { PagePainting } from '@/design-system';
import { luanGiaiPaintingUrl } from '@/config/media';
import { CUNG_SLUGS } from '@/features/la-so/cung-slug';

export const LUAN_GIAI_PAINTING_WIDTH = { small: 320, large: 640 } as const;

export function luanGiaiPainting(sourceCung: string | undefined): PagePainting | undefined {
  const cung = CUNG_NAMES.find((name) => name === sourceCung);
  if (cung === undefined) return undefined;
  const slug = CUNG_SLUGS[cung];
  return {
    small: luanGiaiPaintingUrl(slug, LUAN_GIAI_PAINTING_WIDTH.small),
    large: luanGiaiPaintingUrl(slug, LUAN_GIAI_PAINTING_WIDTH.large),
  };
}
