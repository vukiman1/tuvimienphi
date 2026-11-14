import type { ReactElement } from 'react';
import { Emphasis, PageHero } from '@/design-system';
import { MEDIA } from '@/config/media';
import type { ChartMeta } from '@/features/la-so/chart-types';
import { ViewYearPicker } from '@/features/la-so/components/view-year-picker';

interface LaSoHeroProps {
  readonly fullName: string;
  readonly meta: ChartMeta;
  readonly birthYear: number;
  readonly viewYear: number;
  readonly onViewYearChange: (year: number) => void;
}

export function LaSoHero({
  fullName,
  meta,
  birthYear,
  viewYear,
  onViewYearChange,
}: LaSoHeroProps): ReactElement {
  const ownerName = fullName.trim();
  const title = ownerName ? (
    <>
      Lá số của <Emphasis>{ownerName}</Emphasis>
    </>
  ) : (
    'Lá Số Tử Vi'
  );

  return (
    <PageHero
      eyebrow={`${meta.amDuong} · ${meta.banMenh}`}
      painting={MEDIA.laSo.heroNight}
      title={title}
    >
      <div>
        <ViewYearPicker birthYear={birthYear} onChange={onViewYearChange} value={viewYear} />
      </div>
    </PageHero>
  );
}
