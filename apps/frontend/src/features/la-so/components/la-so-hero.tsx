import type { ReactElement } from 'react';
import { PageHero } from '@/design-system';
import type { ChartMeta } from '@/features/la-so/chart-types';
import { ViewYearPicker } from '@/features/la-so/components/view-year-picker';

interface LaSoHeroProps {
  readonly meta: ChartMeta;
  readonly birthYear: number;
  readonly viewYear: number;
  readonly onViewYearChange: (year: number) => void;
}

export function LaSoHero({
  meta,
  birthYear,
  viewYear,
  onViewYearChange,
}: LaSoHeroProps): ReactElement {
  return (
    <PageHero eyebrow={`${meta.amDuong} · ${meta.banMenh}`} title="Lá Số Tử Vi">
      <div>
        <ViewYearPicker birthYear={birthYear} onChange={onViewYearChange} value={viewYear} />
      </div>
    </PageHero>
  );
}
