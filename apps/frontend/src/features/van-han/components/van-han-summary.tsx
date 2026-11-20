import type { ReactElement } from 'react';
import type { VanHanCurrent } from '@org/shared-contracts';
import { getYearCanChi } from '@org/shared-tu-vi';
import { Eyebrow, TextLink } from '@/design-system';
import {
  VAN_HAN_YEAR_ZODIAC_ROUTE,
  VAN_HAN_ZODIAC_ROUTE,
  vanHanZodiacSlug,
} from '@/features/van-han/van-han-paths';
import { resolveVanHanView } from '@/features/van-han/van-han-view';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { ZODIAC_PANEL_ID, zodiacTabId } from './zodiac-tab-ids';

const UNDATED_EYEBROW = 'Vận hạn';

interface VanHanSummaryProps {
  readonly chi: ZodiacChi;
  readonly current: VanHanCurrent | null;
  readonly publishedYears: readonly number[];
}

function yearEyebrow(current: VanHanCurrent | null): string {
  return current ? `Vận hạn năm ${getYearCanChi(current.year)} ${current.year}` : UNDATED_EYEBROW;
}

function publishedNextYear(
  current: VanHanCurrent | null,
  publishedYears: readonly number[],
): number | undefined {
  if (!current) return undefined;
  const nextYear = current.year + 1;
  return publishedYears.includes(nextYear) ? nextYear : undefined;
}

export function VanHanSummary({ chi, current, publishedYears }: VanHanSummaryProps): ReactElement {
  const view = resolveVanHanView(current, chi);
  const nextYear = publishedNextYear(current, publishedYears);
  const slug = vanHanZodiacSlug(chi);
  const lead =
    view?.fortune.overview[0] ??
    `Vận hạn của tuổi ${chi} chưa được cập nhật. Vui lòng quay lại sau.`;

  return (
    <section
      aria-labelledby={zodiacTabId(chi)}
      className="flex flex-col gap-3 rounded-2xl border border-ink/15 bg-day p-5 text-ink md:p-8"
      id={ZODIAC_PANEL_ID}
      role="tabpanel"
    >
      <div className="text-ink-soft">
        <Eyebrow>{yearEyebrow(current)}</Eyebrow>
      </div>
      <h2 className="font-emphasis text-3xl font-bold">{`Tuổi ${chi}`}</h2>
      <p className="min-h-5 text-sm text-ink-soft">
        {view && `Sinh năm: ${view.fortune.birthYears.join(', ')}`}
      </p>
      <p className="line-clamp-4 min-h-24 max-w-reading text-base/6 md:line-clamp-3 md:min-h-18">
        {lead}
      </p>
      <div className="flex flex-wrap gap-x-6">
        <TextLink params={{ slug }} to={VAN_HAN_ZODIAC_ROUTE}>
          {`Xem đầy đủ vận hạn tuổi ${chi}`}
        </TextLink>
        {nextYear !== undefined && (
          <TextLink params={{ year: String(nextYear), slug }} to={VAN_HAN_YEAR_ZODIAC_ROUTE}>
            {`Vận hạn tuổi ${chi} năm ${nextYear}`}
          </TextLink>
        )}
      </div>
    </section>
  );
}
