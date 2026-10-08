import type { VanHanCurrent } from '@org/shared-contracts';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { toVanHanFortune, type VanHanFortune } from './map-van-han';

export interface VanHanView {
  readonly year: number;
  readonly fortune: VanHanFortune;
}

export function orderOfChi(chi: ZodiacChi): number {
  return ZODIAC_CHI.findIndex((entry) => entry.chi === chi) + 1;
}

export function resolveVanHanView(
  current: VanHanCurrent | null | undefined,
  chi: ZodiacChi,
): VanHanView | null {
  const entry = current?.entries.find((item) => item.zodiacOrder === orderOfChi(chi));
  if (!current || !entry) {
    return null;
  }

  return { year: current.year, fortune: toVanHanFortune(entry) };
}
