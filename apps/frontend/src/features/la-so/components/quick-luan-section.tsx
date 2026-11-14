import type { ReactElement } from 'react';
import type { CungName, LuanDe } from '@org/shared-tu-vi';
import { CHAPTER_FOR_CUNG } from '@/features/la-so/cung-chapters';
import { PanelSection } from '@/features/la-so/components/panel-section';
import { LUAN_GIAI_CHAPTERS, type LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { useQuickLuan } from '@/features/la-so/use-quick-luan';
import type { BirthInput } from '@/features/la-so/birth-input';

interface QuickLuanSectionProps {
  readonly birth: BirthInput;
  readonly cung: CungName;
  readonly onReadChapter: (order: string) => void;
}

interface ClaimRowProps {
  readonly label: string;
  readonly claim: LuanDe;
}

function asSentence(claim: string): string {
  return `${claim.charAt(0).toUpperCase()}${claim.slice(1)}.`;
}

function ClaimRow({ label, claim }: ClaimRowProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-ink-soft uppercase">{label}</p>
      <p className="text-reading">{asSentence(claim.y)}</p>
      <p className="text-sm text-ink-soft">Vì sao: {claim.do.join(', ')}</p>
    </div>
  );
}

function ClaimSkeleton(): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-5 rounded-full bg-ink-soft/20" />
      <div className="h-4 w-2/3 rounded-full bg-ink-soft/20" />
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
  return LUAN_GIAI_CHAPTERS.find((candidate) => candidate.order === CHAPTER_FOR_CUNG[cung]);
}

export function QuickLuanSection({
  birth,
  cung,
  onReadChapter,
}: QuickLuanSectionProps): ReactElement | null {
  const { data, isPending } = useQuickLuan(birth, cung);
  const chapter = chapterFor(cung);
  if (!chapter) return null;

  return (
    <PanelSection title="Luận nhanh">
      {isPending ? <LuanSkeleton /> : null}
      {data ? (
        <>
          <ClaimRow label="Nét thuận" claim={data.thuan} />
          <ClaimRow label="Cần để ý" claim={data.nghich} />
        </>
      ) : null}
      <button
        type="button"
        className="self-start text-sm font-semibold text-ink underline underline-offset-4"
        onClick={() => onReadChapter(chapter.order)}
      >
        Đọc luận giải chương {chapter.title}
      </button>
    </PanelSection>
  );
}
