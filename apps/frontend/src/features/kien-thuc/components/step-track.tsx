import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { StepStatus } from '../path-progress';
import type { TrackedStep } from '../path-progress';

const TRACK_LABEL = 'Lộ trình';

const POINT_CLASS: Readonly<Record<StepStatus, string>> = {
  [StepStatus.Read]: 'size-3 rounded-full bg-gold',
  [StepStatus.Current]: 'size-4 rounded-full inset-ring-2 inset-ring-gold',
  [StepStatus.Unread]: 'size-2 rounded-full inset-ring-1 inset-ring-day-soft',
};

const STATUS_WORDS: Readonly<Record<StepStatus, string>> = {
  [StepStatus.Read]: 'đã đọc',
  [StepStatus.Current]: 'đang xem',
  [StepStatus.Unread]: 'chưa đọc',
};

interface StepTrackProps {
  readonly steps: readonly TrackedStep[];
}

export function StepTrack({ steps }: StepTrackProps): ReactElement {
  return (
    <ol aria-label={TRACK_LABEL} className="flex w-full max-w-md items-center">
      {steps.map(({ step, status }, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.step}
            data-status={status}
            className={cn('flex items-center gap-2', !isLast && 'flex-1')}
          >
            <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
              <span className={POINT_CLASS[status]} />
            </span>
            <span className="sr-only">{`Bước ${step.step}: ${step.title}, ${STATUS_WORDS[status]}`}</span>
            {!isLast && <span aria-hidden="true" className="h-px flex-1 bg-day/20" />}
          </li>
        );
      })}
    </ol>
  );
}
