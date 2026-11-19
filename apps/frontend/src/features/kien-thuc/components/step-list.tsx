import { useId } from 'react';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import type { KienThucManifest } from '@org/shared-contracts';
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

const ROW_CLASS = cn(
  'relative grid grid-cols-[3rem_minmax(0,1fr)_7rem] items-center gap-3 rounded-xl px-4 py-3 text-ink no-underline hover:bg-day-200',
  FOCUS_RING_CLASS,
);

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

function StepStatusMark({ row }: StepStatusMarkProps): ReactElement | null {
  if (row.status === StepStatus.Read) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold">
          <Check aria-hidden="true" className="size-4 stroke-ink" />
        </span>
        Đã đọc
      </span>
    );
  }
  if (row.status === StepStatus.Current) {
    return (
      <span className="text-sm font-bold">{`Đang học ${row.readCount}/${row.lessonCount}`}</span>
    );
  }
  return null;
}

function StepRow({ row }: StepRowProps): ReactElement {
  return (
    <Link to={lessonPath(row.targetSlug)} data-status={row.status} className={ROW_CLASS}>
      {row.status === StepStatus.Current && <StateBar />}
      <span className="font-display text-2xl font-extrabold">{stepNumber(row.step.step)}</span>
      <span className="flex flex-col gap-1">
        <span className="font-bold">{row.step.title}</span>
        <span className="text-sm text-ink-soft">{`${row.lessonCount} bài · ${row.minutes} phút`}</span>
      </span>
      <span className="flex w-28 items-center">
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
      <ol aria-labelledby={titleId} className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.step.step}>
            <StepRow row={row} />
          </li>
        ))}
      </ol>
    </section>
  );
}
