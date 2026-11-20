import { natalLunarYear } from '@org/shared-tu-vi';
import { readLocalHistory } from '@/features/la-so/history/local-history-store';
import { useIsClient } from '@/hooks/use-is-client';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { readRememberedZodiac } from './remembered-zodiac';
import { zodiacChiOfLunarYear } from './zodiac-of-year';

function latestChartZodiac(): ZodiacChi | null {
  const [latest] = readLocalHistory();
  return latest ? zodiacChiOfLunarYear(natalLunarYear(latest)) : null;
}

function readPreferredZodiac(): ZodiacChi | null {
  return readRememberedZodiac() ?? latestChartZodiac();
}

export function usePreferredZodiac(): ZodiacChi | null {
  const isClient = useIsClient();
  return isClient ? readPreferredZodiac() : null;
}
