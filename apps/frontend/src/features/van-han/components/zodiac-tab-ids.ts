import { vanHanZodiacSlug } from '@/features/van-han/van-han-paths';
import type { ZodiacChi } from '@/lib/zodiac-icons';

export const ZODIAC_PANEL_ID = 'van-han-zodiac-panel';

export function zodiacTabId(chi: ZodiacChi): string {
  return `van-han-tab-${vanHanZodiacSlug(chi)}`;
}
