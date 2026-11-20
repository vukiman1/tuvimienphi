import { useRef, type ReactElement } from 'react';
import type { KienThucManifest } from '@org/shared-contracts';
import { ProgressCardStatus, useProgressCard } from '../progress/use-progress-card';
import { ProgressCard } from './progress-card';

interface ProgressCardSlotProps {
  readonly manifest: KienThucManifest;
  readonly lessonSlug: string | null;
}

export function ProgressCardSlot({ manifest, lessonSlug }: ProgressCardSlotProps): ReactElement {
  const card = useProgressCard(manifest, lessonSlug);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} tabIndex={-1}>
      {card.status === ProgressCardStatus.Due && (
        <ProgressCard
          readCount={card.readCount}
          totalCount={card.totalCount}
          onSignIn={card.signIn}
          onSnooze={() => {
            card.snooze();
            ref.current?.focus();
          }}
        />
      )}
    </div>
  );
}
