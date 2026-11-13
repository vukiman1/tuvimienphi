import type { ReactElement } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HourDial } from '@/features/ngay-tot/components/hour-dial';
import { StarRating } from '@/features/ngay-tot/components/star-rating';
import type { HourEntry } from '@/features/ngay-tot/hour-quality';
import { cn } from '@/lib/utils';

enum DetailTone {
  Neutral = 'neutral',
  Good = 'good',
  Bad = 'bad',
}

const DETAIL_TONE_CLASS: Readonly<Record<DetailTone, string>> = {
  [DetailTone.Neutral]: 'bg-day text-ink',
  [DetailTone.Good]: 'bg-gold text-ink',
  [DetailTone.Bad]: 'bg-ink text-day',
};

function DetailRow({
  label,
  tone,
  text,
}: {
  readonly label: string;
  readonly tone: DetailTone;
  readonly text: string;
}): ReactElement {
  return (
    <p className="text-sm leading-relaxed text-ink">
      <span
        className={cn(
          'mr-2 inline-block rounded px-1.5 py-0.5 align-middle text-2xs font-bold tracking-wide uppercase',
          DETAIL_TONE_CLASS[tone],
        )}
      >
        {label}
      </span>
      {text}
    </p>
  );
}

interface HourDetailDialogProps {
  readonly entry: HourEntry | null;
  readonly onClose: () => void;
  readonly onCloseAutoFocus: (event: Event) => void;
}

export function HourDetailDialog({
  entry,
  onClose,
  onCloseAutoFocus,
}: HourDetailDialogProps): ReactElement {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={entry !== null}>
      <DialogContent className="max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        {entry && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <span className="flex shrink-0 rounded-full bg-day-200 p-2">
                  <HourDial chiIndex={entry.chiIndex} className="size-16" />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="font-display text-2xl font-extrabold text-ink">
                    {entry.item.canChi}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-ink-soft">
                    {entry.item.range} · {entry.item.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <StarRating rating={entry.item.rating} />

            <div className="flex flex-col gap-2.5 rounded-lg bg-day-200 px-4 py-3">
              <DetailRow label="Tinh" text={entry.item.stars} tone={DetailTone.Neutral} />
              <DetailRow label="Nghi" text={entry.item.favorable} tone={DetailTone.Good} />
              <DetailRow label="Kỵ" text={entry.item.unfavorable} tone={DetailTone.Bad} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
