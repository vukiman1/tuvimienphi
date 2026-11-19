import type { ReactElement } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepStatus } from '../path-progress';
import type { TrackedStep } from '../path-progress';

const TRACK_LABEL = 'Lộ trình';

const POINT_CLASS: Readonly<Record<StepStatus, string>> = {
  [StepStatus.Read]: 'size-7 inset-ring-2 inset-ring-gold text-gold',
  [StepStatus.Current]: 'size-9 bg-gold text-base text-ink',
  [StepStatus.Unread]: 'size-7 inset-ring-1 inset-ring-day-soft text-xs text-day',
};

const STATUS_WORDS: Readonly<Record<StepStatus, string>> = {
  [StepStatus.Read]: 'đã đọc',
  [StepStatus.Current]: 'đang xem',
  [StepStatus.Unread]: 'chưa đọc',
};

interface StepTrackProps {
  readonly steps: readonly TrackedStep[];
}

interface TrackPointProps {
  readonly step: number;
  readonly status: StepStatus;
}

function TrackPoint({ step, status }: TrackPointProps): ReactElement {
  return (
    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center">
      <span
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          POINT_CLASS[status],
        )}
      >
        {status === StepStatus.Read ? <Check className="size-4" /> : step}
      </span>
    </span>
  );
}

export function StepTrack({ steps }: StepTrackProps): ReactElement {
  return (
    <ol aria-label={TRACK_LABEL} className="flex w-full max-w-xl items-center">
      {steps.map(({ step, status }, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.step}
            data-status={status}
            className={cn('flex items-center gap-1', !isLast && 'flex-1')}
          >
            <TrackPoint step={step.step} status={status} />
            <span className="sr-only">{`Bước ${step.step}: ${step.title}, ${STATUS_WORDS[status]}`}</span>
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-0.5 flex-1 rounded-full',
                  status === StepStatus.Read ? 'bg-gold' : 'bg-day/20',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
