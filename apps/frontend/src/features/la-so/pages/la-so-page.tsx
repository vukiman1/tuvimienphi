import { useMemo, useState, type ReactElement } from 'react';
import { Navigate, getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  LUAN_GIAI_ANCHOR_ID,
  LuanGiaiSection,
} from '@/features/la-so/components/luan-giai-section';
import { LUAN_GIAI_CHAPTERS, LUAN_GIAI_MOTTO } from '@/features/la-so/luan-giai-data';
import { birthInputSchema } from '@/features/la-so/birth-input';
import { CUNG_SLUGS, cungNameFromSlug } from '@/features/la-so/cung-slug';
import { LaSoHero } from '@/features/la-so/components/la-so-hero';
import { LaSoWorkspace } from '@/features/la-so/components/la-so-workspace';
import { useRecordChartView } from '@/features/la-so/history/use-record-chart-view';
import { toChartView } from '@/features/la-so/to-chart-view';
import type { ChartView } from '@/features/la-so/chart-types';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const route = getRouteApi('/_site/la-so/detail');

function selectedCungIndex(chart: ChartView, slug: string | undefined): number {
  const pickedName = cungNameFromSlug(slug);
  const pickedIndex = chart.cungs.findIndex((cung) => cung.cungName === pickedName);
  return pickedIndex === -1 ? chart.cungs.findIndex((cung) => cung.isMenh) : pickedIndex;
}

export function LaSoPage(): ReactElement {
  const search = route.useSearch();
  const navigate = useNavigate({ from: '/la-so/detail' });
  const viewYear = search.viewYear ?? new Date().getFullYear();
  const { fullName, day, month, year, calendar, hour, gender } = search;

  const birth = useMemo(() => {
    const parsed = birthInputSchema.safeParse({
      fullName,
      day,
      month,
      year,
      calendar,
      hour,
      gender,
    });
    return parsed.success ? parsed.data : null;
  }, [fullName, day, month, year, calendar, hour, gender]);
  const chart = useMemo(
    () => (birth ? toChartView({ ...birth, viewYear }) : null),
    [birth, viewYear],
  );

  useRecordChartView(birth);
  const [activeChapter, setActiveChapter] = useState(LUAN_GIAI_CHAPTERS[0].order);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!birth || !chart) {
    return <Navigate to="/la-so" />;
  }

  const selectedIndex = selectedCungIndex(chart, search.cung);

  const pickCung = (cungIndex: number): void => {
    void navigate({
      search: (prev) => ({ ...prev, cung: CUNG_SLUGS[chart.cungs[cungIndex].cungName] }),
      replace: true,
      resetScroll: false,
    });
  };

  const readChapter = (order: string): void => {
    setActiveChapter(order);
    const anchor = document.getElementById(LUAN_GIAI_ANCHOR_ID);
    anchor?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    anchor?.focus({ preventScroll: true });
  };

  return (
    <main className="w-full">
      <LaSoHero
        birthYear={year ?? viewYear}
        fullName={birth.fullName ?? ''}
        meta={chart.meta}
        onViewYearChange={(year) =>
          void navigate({ search: (prev) => ({ ...prev, viewYear: year }) })
        }
        viewYear={viewYear}
      />

      <LaSoWorkspace
        birth={birth}
        chart={chart}
        onReadChapter={readChapter}
        onSelect={pickCung}
        selectedIndex={selectedIndex}
        viewYear={viewYear}
      />

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
