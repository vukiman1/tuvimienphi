import { getYearPillar } from '@org/shared-tu-vi';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';

export function zodiacChiOfLunarYear(lunarYear: number): ZodiacChi {
  return ZODIAC_CHI[getYearPillar(lunarYear).chi].chi;
}
