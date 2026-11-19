import { useId } from 'react';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import type { KienThucManifest } from '@org/shared-contracts';
import { KIEN_THUC_STEPS } from '@org/shared-kien-thuc';
import { DisplaySize, DisplayTitle, FOCUS_RING_CLASS, TitleFace } from '@/design-system';
import { cn } from '@/lib/utils';
import { lessonPath } from '../kien-thuc-paths';
import { StepStatus, pathProgress } from '../path-progress';
import type { StepProgress } from '../path-progress';
import { useLessonProgress } from '../progress/use-lesson-progress';
import { StateBar } from './state-bar';

const PATH_TITLE = 'Lộ trình';
const STEP_NUMBER_DIGITS = 2;
const STEP_NUMBER_PAD = '0';

const STEP_SUMMARY: ReadonlyMap<number, string> = new Map(
  KIEN_THUC_STEPS.map(({ step, summary }) => [step, summary]),
);

const ROW_CLASS = cn(
  'relative grid grid-cols-[2.75rem_minmax(0,1fr)_7rem] items-center gap-x-3 gap-y-2 px-4 py-4 text-ink no-underline hover:bg-day-200 sm:grid-cols-[4rem_minmax(0,1fr)_9rem] md:grid-cols-[5rem_minmax(0,1fr)_8rem_9rem] md:gap-x-6 md:px-6',
  FOCUS_RING_CLASS,
);

const RING_CLASS = 'flex size-6 shrink-0 items-center justify-center rounded-full';

interface StepListProps {
  readonly manifest: KienThucManifest;
}

interface StepRowProps {
  readonly row: StepProgress;
}

interface StepStatusMarkProps {
  readonly row: StepProgress;
}

function stepNumber(step: number): string {
  return String(step).padStart(STEP_NUMBER_DIGITS, STEP_NUMBER_PAD);
}

function StepStatusMark({ row }: StepStatusMarkProps): ReactElement {
  if (row.status === StepStatus.Read) {
    return (
      <>
        <span className={cn(RING_CLASS, 'bg-gold')}>
          <Check aria-hidden="true" className="size-4 stroke-ink" />
        </span>
        Đã đọc
      </>
    );
  }
  if (row.status === StepStatus.Current) {
    return (
      <>
        <span aria-hidden="true" className={cn(RING_CLASS, 'inset-ring-2 inset-ring-gold')} />
        <span className="font-bold">{`Đang học ${row.readCount}/${row.lessonCount}`}</span>
      </>
    );
  }
  return <span aria-hidden="true" className={cn(RING_CLASS, 'inset-ring-1 inset-ring-ink-soft')} />;
}

function StepRow({ row }: StepRowProps): ReactElement {
  return (
    <Link to={lessonPath(row.targetSlug)} data-status={row.status} className={ROW_CLASS}>
      {row.status === StepStatus.Current && <StateBar />}
      <span className="col-start-1 row-span-2 row-start-1 font-emphasis text-3xl leading-none font-semibold italic sm:text-4xl md:row-span-1 md:text-5xl">
        {stepNumber(row.step.step)}
      </span>
      <span className="col-start-2 col-end-4 row-start-1 flex flex-col gap-1 md:col-end-3">
        <span className="font-emphasis text-xl font-bold">{row.step.title}</span>
        <span className="text-sm text-ink-soft">{STEP_SUMMARY.get(row.step.step)}</span>
      </span>
      <span className="col-start-2 row-start-2 text-sm text-ink-soft md:col-start-3 md:row-start-1 md:text-right">
        {`${row.lessonCount} bài · ${row.minutes} phút`}
      </span>
      <span className="col-start-3 row-start-2 flex w-28 items-center gap-2 text-xs sm:w-36 sm:text-sm md:col-start-4 md:row-start-1">
        <StepStatusMark row={row} />
      </span>
    </Link>
  );
}

export function StepList({ manifest }: StepListProps): ReactElement {
  const titleId = useId();
  const { readSlugs } = useLessonProgress();
  const rows = pathProgress(manifest, readSlugs);

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <DisplayTitle id={titleId} size={DisplaySize.Card} face={TitleFace.Serif}>
        {PATH_TITLE}
      </DisplayTitle>
      <ol
        aria-labelledby={titleId}
        className="divide-y divide-ink/15 overflow-clip rounded-2xl border border-ink/15 bg-day"
      >
        {rows.map((row) => (
          <li key={row.step.step}>
            <StepRow row={row} />
          </li>
        ))}
      </ol>
    </section>
  );
}
