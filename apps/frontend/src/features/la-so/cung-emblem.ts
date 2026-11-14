import type { CungName } from '@org/shared-tu-vi';
import { cungEmblemUrl } from '@/config/media';
import { CUNG_SLUGS } from '@/features/la-so/cung-slug';

export const CUNG_EMBLEM_WIDTH = { small: 128, large: 256 } as const;

export interface CungEmblemSources {
  readonly small: string;
  readonly large: string;
}

export function cungEmblem(name: CungName): CungEmblemSources {
  const slug = CUNG_SLUGS[name];
  return {
    small: cungEmblemUrl(slug, CUNG_EMBLEM_WIDTH.small),
    large: cungEmblemUrl(slug, CUNG_EMBLEM_WIDTH.large),
  };
}
