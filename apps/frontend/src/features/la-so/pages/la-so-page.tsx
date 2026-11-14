import { useMemo, useState, type ReactElement } from 'react';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import { LaSoBoard } from '@/features/la-so/components/la-so-board';
import { LuanGiaiSection } from '@/features/la-so/components/luan-giai-section';
import { LUAN_GIAI_CHAPTERS, LUAN_GIAI_MOTTO } from '@/features/la-so/luan-giai-data';
import { birthInputSchema } from '@/features/la-so/birth-input';
import { CUNG_SLUGS, cungNameFromSlug, cungNameOf } from '@/features/la-so/cung-slug';
import { LaSoHero } from '@/features/la-so/components/la-so-hero';
import { useRecordChartView } from '@/features/la-so/history/use-record-chart-view';
import { toChartView } from '@/features/la-so/to-chart-view';
import type { ChartView } from '@/features/la-so/chart-types';

const route = getRouteApi('/_site/la-so/detail');

function selectedCungIndex(chart: ChartView, slug: string | undefined): number {
  const pickedName = cungNameFromSlug(slug);
  const pickedIndex = chart.cungs.findIndex((cung) => cungNameOf(cung) === pickedName);
  return pickedIndex === -1 ? chart.cungs.findIndex((cung) => cung.isMenh) : pickedIndex;
}

export function LaSoPage(): ReactElement {
  const search = route.useSearch();
  const navigate = useNavigate({ from: '/la-so/detail' });
  const viewYear = search.viewYear ?? new Date().getFullYear();

  const birth = useMemo(() => {
    const parsed = birthInputSchema.safeParse(search);
    return parsed.success ? parsed.data : null;
  }, [search]);
  const chart = useMemo(
    () => (birth ? toChartView({ ...birth, viewYear }) : null),
    [birth, viewYear],
  );

  useRecordChartView(birth);
  const [activeChapter, setActiveChapter] = useState(LUAN_GIAI_CHAPTERS[0].order);

  if (!birth || !chart) {
    return <Navigate to="/la-so" />;
  }

  const selectedIndex = selectedCungIndex(chart, search.cung);
  const selected = chart.cungs[selectedIndex];

  const pickCung = (cungIndex: number): void => {
    const pickedView = chart.cungs.find((cung) => cung.index === cungIndex);
    if (!pickedView) return;
    void navigate({
      search: (prev) => ({ ...prev, cung: CUNG_SLUGS[cungNameOf(pickedView)] }),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <main className="w-full">
      <LaSoHero
        birthYear={search.year ?? viewYear}
        meta={chart.meta}
        onViewYearChange={(year) =>
          void navigate({ search: (prev) => ({ ...prev, viewYear: year }) })
        }
        viewYear={viewYear}
      />

      <section className="bg-day">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <LaSoBoard chart={chart} onSelect={pickCung} selectedIndex={selectedIndex} />
          <p className="mt-4 text-center text-sm text-ink-soft">
            Đang chọn cung <span className="font-semibold text-ink">{selected.name}</span> ·{' '}
            {selected.canChi} · đại vận {selected.daiVanStartAge}–{selected.daiVanStartAge + 9} tuổi
          </p>
        </div>
      </section>

      <LuanGiaiSection
        activeChapter={activeChapter}
        birth={birth}
        chapters={LUAN_GIAI_CHAPTERS}
        motto={LUAN_GIAI_MOTTO}
        onSelectChapter={setActiveChapter}
        viewYear={viewYear}
      />
    </main>
  );
}
