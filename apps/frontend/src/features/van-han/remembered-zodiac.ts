import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';

export const REMEMBERED_ZODIAC_STORAGE_KEY = 'tuvimienphi:van-han-zodiac:v1';

function isZodiacChi(value: string | null): value is ZodiacChi {
  return ZODIAC_CHI.some((entry) => entry.chi === value);
}

export function readRememberedZodiac(): ZodiacChi | null {
  try {
    const stored = window.localStorage.getItem(REMEMBERED_ZODIAC_STORAGE_KEY);
    return isZodiacChi(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function rememberZodiac(chi: ZodiacChi): void {
  try {
    window.localStorage.setItem(REMEMBERED_ZODIAC_STORAGE_KEY, chi);
  } catch {
    return;
  }
}
