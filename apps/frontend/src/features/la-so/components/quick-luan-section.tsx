import type { ReactElement } from 'react';
import { type CungName, type LuanDe, type QuickCungLuan, type Rating } from '@org/shared-tu-vi';
import { FOCUS_RING_CLASS } from '@/design-system';
import { starRatings } from '@/features/la-so/chart-star-ratings';
import type { ChartView } from '@/features/la-so/chart-types';
import { RATING_LABEL } from '@/features/la-so/components/cung-panel.constants';
import { CHAPTER_FOR_CUNG } from '@/features/la-so/cung-chapters';
import { PanelSection } from '@/features/la-so/components/panel-section';
import { LUAN_GIAI_CHAPTERS, type LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { cn } from '@/lib/utils';
import { useQuickLuan } from '@/features/la-so/use-quick-luan';
import type { BirthInput } from '@/features/la-so/birth-input';

interface QuickLuanSectionProps {
  readonly birth: BirthInput;
  readonly chart: ChartView;
  readonly cung: CungName;
  readonly onReadChapter: (order: string) => void;
}

interface QuickLuanClaimsProps {
  readonly luan: QuickCungLuan;
  readonly chart: ChartView;
}

interface SkeletonLineProps {
  readonly textClass: string;
  readonly widthClass: string;
}

interface ClaimRowProps {
  readonly label: string;
  readonly claim: LuanDe;
  readonly ratings: ReadonlyMap<string, Rating>;
}

function asSentence(claim: string): string {
  return `${claim.charAt(0).toUpperCase()}${claim.slice(1)}.`;
}

function starWithRating(name: string, ratings: ReadonlyMap<string, Rating>): string {
  const rating = ratings.get(name);
  return rating ? `${name} (${RATING_LABEL[rating]})` : name;
}

function ClaimRow({ label, claim, ratings }: ClaimRowProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-ink-soft uppercase">{label}</p>
      <p className="text-reading">{asSentence(claim.y)}</p>
      <p className="text-sm text-ink-soft">
        Vì sao: {claim.do.map((name) => starWithRating(name, ratings)).join(', ')}
      </p>
    </div>
  );
}

function QuickLuanClaims({ luan, chart }: QuickLuanClaimsProps): ReactElement {
  const ratings = starRatings(chart);
  return (
    <>
      <ClaimRow label="Nét thuận" claim={luan.thuan} ratings={ratings} />
      <ClaimRow label="Cần để ý" claim={luan.nghich} ratings={ratings} />
    </>
  );
}

function SkeletonLine({ textClass, widthClass }: SkeletonLineProps): ReactElement {
  return (
    <p aria-hidden className={textClass}>
      <span className={cn('block rounded-full bg-ink-soft/20', widthClass)}>&nbsp;</span>
    </p>
  );
}

function ClaimSkeleton(): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <SkeletonLine textClass="text-xs font-bold" widthClass="w-1/4" />
      <SkeletonLine textClass="text-reading" widthClass="w-full" />
      <SkeletonLine textClass="text-reading" widthClass="w-2/3" />
      <SkeletonLine textClass="text-sm" widthClass="w-1/2" />
    </div>
  );
}

function LuanSkeleton(): ReactElement {
  return (
    <div
      role="status"
      aria-label="Đang soạn luận nhanh"
      className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none"
    >
      <ClaimSkeleton />
      <ClaimSkeleton />
    </div>
  );
}

function chapterFor(cung: CungName): LuanGiaiChapter | undefined {
  const order = CHAPTER_FOR_CUNG[cung];
  return LUAN_GIAI_CHAPTERS.find((candidate) => candidate.order === order);
}

export function QuickLuanSection({
  birth,
  chart,
  cung,
  onReadChapter,
}: QuickLuanSectionProps): ReactElement | null {
  const { data, isPending } = useQuickLuan(birth, cung);
  const chapter = chapterFor(cung);
  if (!isPending && !data) return null;

  return (
    <PanelSection title="Luận nhanh">
      {data ? <QuickLuanClaims chart={chart} luan={data} /> : <LuanSkeleton />}
      {chapter ? (
        <button
          type="button"
          className={cn(
            'self-start text-sm font-semibold text-ink underline underline-offset-4',
            FOCUS_RING_CLASS,
          )}
          onClick={() => onReadChapter(chapter.order)}
        >
          Đọc luận giải chương {chapter.title}
        </button>
      ) : null}
    </PanelSection>
  );
}
