import { conGiapSlug, findConGiapBySlug } from '@org/shared-tu-vi';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';

export const VAN_HAN_PATH = '/van-han';

function chiIndex(chi: ZodiacChi): number {
  return ZODIAC_CHI.findIndex((entry) => entry.chi === chi);
}

export function vanHanZodiacSlug(chi: ZodiacChi): string {
  return conGiapSlug(chiIndex(chi));
}

export function vanHanZodiacPath(chi: ZodiacChi): string {
  return `${VAN_HAN_PATH}/${vanHanZodiacSlug(chi)}`;
}

export function zodiacChiFromVanHanSlug(slug: string): ZodiacChi | undefined {
  const index = findConGiapBySlug(slug);
  return index === undefined ? undefined : ZODIAC_CHI[index].chi;
}
