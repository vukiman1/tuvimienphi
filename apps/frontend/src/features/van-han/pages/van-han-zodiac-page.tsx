import { useEffect, type ReactElement } from 'react';
import type { VanHanCurrent } from '@org/shared-contracts';
import { PageHero, PaintingFocus, TextLink } from '@/design-system';
import { VAN_HAN_PAINTING } from '@/features/van-han/van-han-media';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { VanHanDetail, VanHanDetailEmpty } from '@/features/van-han/components/van-han-detail';
import { VanHanFacts } from '@/features/van-han/components/van-han-facts';
import { VanHanYearSwitch } from '@/features/van-han/components/van-han-year-switch';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { rememberZodiac } from '@/features/van-han/remembered-zodiac';
import { VAN_HAN_PATH, vanHanZodiacSlug } from '@/features/van-han/van-han-paths';
import { resolveVanHanView } from '@/features/van-han/van-han-view';
import { vanHanZodiacTitle } from '@/features/van-han/van-han-zodiac-head';
import { TET_HUB_SLUG_ROUTE, TET_HUB_TITLE } from '@/features/tet-hub/tet-hub-paths';

const BACK_TO_LIST_LABEL = '← Vận hạn 12 con giáp';

interface VanHanZodiacPageProps {
  readonly chi: ZodiacChi;
  readonly current: VanHanCurrent | null;
  readonly publishedYears: readonly number[];
  readonly yearInPath?: number;
}

export function VanHanZodiacPage({
  chi,
  current,
  publishedYears,
  yearInPath,
}: VanHanZodiacPageProps): ReactElement {
  const view = resolveVanHanView(current, chi);
  useEffect(() => rememberZodiac(chi), [chi]);
  return (
    <main className="w-full bg-day">
      <PageHero
        breadcrumb={
          <div>
            <TextLink to={VAN_HAN_PATH}>{BACK_TO_LIST_LABEL}</TextLink>
          </div>
        }
        painting={VAN_HAN_PAINTING}
        paintingFocus={PaintingFocus.Middle}
        title={vanHanZodiacTitle(chi, current)}
      >
        <div className="flex flex-col gap-4">
          {view && <VanHanFacts birthYears={view.fortune.birthYears} chi={chi} year={view.year} />}
          <div>
            <TextLink params={{ slug: vanHanZodiacSlug(chi) }} to={TET_HUB_SLUG_ROUTE}>
              {`${TET_HUB_TITLE} tuổi ${chi}`}
            </TextLink>
          </div>
          {current && (
            <VanHanYearSwitch chi={chi} publishedYears={publishedYears} shownYear={current.year} />
          )}
        </div>
      </PageHero>
      <section className="mx-auto flex max-w-6xl flex-col gap-12 bg-day px-4 py-8 md:px-6 md:py-12">
        {view ? <VanHanDetail chi={chi} fortune={view.fortune} /> : <VanHanDetailEmpty chi={chi} />}
        <ZodiacPicker year={yearInPath} />
      </section>
    </main>
  );
}
