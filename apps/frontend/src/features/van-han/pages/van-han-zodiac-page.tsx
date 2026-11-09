import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { VanHanCurrent } from '@org/shared-contracts';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { VanHanDetail, VanHanDetailEmpty } from '@/features/van-han/components/van-han-detail';
import { VanHanYearSwitch } from '@/features/van-han/components/van-han-year-switch';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { VAN_HAN_PATH, vanHanZodiacSlug } from '@/features/van-han/van-han-paths';
import { resolveVanHanView } from '@/features/van-han/van-han-view';
import { vanHanZodiacTitle } from '@/features/van-han/van-han-zodiac-head';
import { TET_HUB_TITLE, tetHubPagePath } from '@/features/tet-hub/tet-hub-paths';

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
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <Link
        className="text-sm text-muted-foreground no-underline hover:underline"
        to={VAN_HAN_PATH}
      >
        {BACK_TO_LIST_LABEL}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{vanHanZodiacTitle(chi, current)}</h1>
      <Link
        className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4"
        to={tetHubPagePath(vanHanZodiacSlug(chi))}
      >
        {`${TET_HUB_TITLE} tuổi ${chi}`}
      </Link>
      {current && (
        <VanHanYearSwitch chi={chi} publishedYears={publishedYears} shownYear={current.year} />
      )}
      <div className="mt-6 flex flex-col gap-4">
        <ZodiacPicker year={yearInPath} />
        {view ? (
          <VanHanDetail chi={chi} currentYear={view.year} fortune={view.fortune} />
        ) : (
          <VanHanDetailEmpty chi={chi} />
        )}
      </div>
    </main>
  );
}
