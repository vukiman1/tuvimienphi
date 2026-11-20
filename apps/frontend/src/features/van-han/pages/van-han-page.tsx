import { useState, type ReactElement } from 'react';
import type { VanHanCurrent } from '@org/shared-contracts';
import { Emphasis, PageHero, PaintingFocus, TextLink } from '@/design-system';
import { VAN_HAN_PAINTING } from '@/features/van-han/van-han-media';
import { VanHanSummary } from '@/features/van-han/components/van-han-summary';
import { ZodiacTabs } from '@/features/van-han/components/zodiac-tabs';
import { rememberZodiac } from '@/features/van-han/remembered-zodiac';
import { usePreferredZodiac } from '@/features/van-han/use-preferred-zodiac';
import { zodiacChiOfLunarYear } from '@/features/van-han/zodiac-of-year';
import { TET_HUB_LINK_LABEL, TET_HUB_PATH } from '@/features/tet-hub/tet-hub-paths';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';

interface VanHanPageProps {
  readonly current: VanHanCurrent | null;
  readonly publishedYears: readonly number[];
}

function currentYearZodiac(current: VanHanCurrent | null): ZodiacChi {
  return current ? zodiacChiOfLunarYear(current.year) : ZODIAC_CHI[0].chi;
}

export function VanHanPage({ current, publishedYears }: VanHanPageProps): ReactElement {
  const [pickedChi, setPickedChi] = useState<ZodiacChi | null>(null);
  const preferredChi = usePreferredZodiac();
  const shownChi = pickedChi ?? preferredChi ?? currentYearZodiac(current);

  function pick(chi: ZodiacChi): void {
    setPickedChi(chi);
    rememberZodiac(chi);
  }

  return (
    <main className="w-full bg-day">
      <PageHero
        painting={VAN_HAN_PAINTING}
        paintingFocus={PaintingFocus.Middle}
        title={
          <>
            Vận <Emphasis isAccent>Hạn</Emphasis>
          </>
        }
        lead="Chọn con giáp để xem sao chiếu mệnh và vận hạn trong năm theo tuổi."
      >
        <div>
          <TextLink to={TET_HUB_PATH}>{TET_HUB_LINK_LABEL}</TextLink>
        </div>
      </PageHero>
      <section className="mx-auto flex max-w-6xl flex-col gap-6 bg-day px-4 py-8 md:gap-8 md:px-6 md:py-12">
        <ZodiacTabs onSelect={pick} selectedChi={shownChi} />
        <VanHanSummary chi={shownChi} current={current} publishedYears={publishedYears} />
      </section>
    </main>
  );
}
