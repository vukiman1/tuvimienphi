import type { VanHanCurrent } from '@org/shared-contracts';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { toVanHanFortune } from './map-van-han';
import type { VanHanFortune } from './placeholder-data';
import { VAN_HAN_FORTUNE_BY_CHI, VAN_HAN_MOCK_YEAR } from './van-han-mock';

export interface VanHanView {
  readonly year: number;
  readonly fortune: VanHanFortune;
  readonly isIllustrative: boolean;
}

export function orderOfChi(chi: ZodiacChi): number {
  return ZODIAC_CHI.findIndex((entry) => entry.chi === chi) + 1;
}

export function resolveVanHanView(
  current: VanHanCurrent | null | undefined,
  chi: ZodiacChi,
): VanHanView {
  const entry = current?.entries.find((item) => item.zodiacOrder === orderOfChi(chi));

  return {
    year: current?.year ?? VAN_HAN_MOCK_YEAR,
    fortune: entry ? toVanHanFortune(entry) : VAN_HAN_FORTUNE_BY_CHI[chi],
    isIllustrative: !entry,
  };
}
