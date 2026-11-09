import type { VanHanCurrent, VanHanEntry } from '@org/shared-contracts';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { toVanHanFortune, type VanHanFortune } from './map-van-han';

export interface VanHanView {
  readonly year: number;
  readonly fortune: VanHanFortune;
}

export function orderOfChi(chi: ZodiacChi): number {
  return ZODIAC_CHI.findIndex((entry) => entry.chi === chi) + 1;
}

export function findVanHanEntry(
  current: VanHanCurrent | null | undefined,
  chi: ZodiacChi,
): VanHanEntry | undefined {
  return current?.entries.find((item) => item.zodiacOrder === orderOfChi(chi));
}

export function publishedYearOf(
  year: number,
  entries: readonly VanHanEntry[],
): VanHanCurrent | null {
  return entries.length > 0 ? { year, entries: [...entries] } : null;
}

export function resolveVanHanView(
  current: VanHanCurrent | null | undefined,
  chi: ZodiacChi,
): VanHanView | null {
  const entry = findVanHanEntry(current, chi);
  if (!current || !entry) {
    return null;
  }

  return { year: current.year, fortune: toVanHanFortune(entry) };
}
