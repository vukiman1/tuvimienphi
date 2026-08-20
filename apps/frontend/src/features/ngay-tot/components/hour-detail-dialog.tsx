import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { HourQuality } from '@/features/ngay-tot/components/hour-quality-list';
import { zodiacIconPath } from '@/lib/zodiac-icons';

const MAX_RATING = 5;

function DetailRow({
  label,
  tone,
  text,
}: {
  readonly label: string;
  readonly tone: 'neutral' | 'good' | 'bad';
  readonly text: string;
}) {
  const toneClass =
    tone === 'good'
      ? 'bg-[#e6f0e1] text-[#3f7350]'
      : tone === 'bad'
        ? 'bg-[#f8e5e3] text-[#a9403a]'
        : 'bg-[#f0e7d5] text-[#7a6242]';

  return (
    <p className="text-sm leading-relaxed text-foreground">
      <span
        className={`mr-2 inline-block rounded px-1.5 py-0.5 align-middle text-[0.65rem] font-bold tracking-wide uppercase ${toneClass}`}
      >
        {label}
      </span>
      {text}
    </p>
  );
}

interface HourDetailDialogProps {
  /** Null while closed; the dialog owns no copy of the hour so it cannot go stale. */
  readonly hour: HourQuality | null;
  readonly onClose: () => void;
}

export function HourDetailDialog({ hour, onClose }: HourDetailDialogProps) {
  const parts = hour ? hour.canChi.split(' ') : [];
  const chi = parts[parts.length - 1] ?? '';
  const iconSrc = hour ? zodiacIconPath(chi, 'default') : null;

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={hour !== null}>
      <DialogContent className="max-w-md">
        {hour && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[#c9a15c]/30 bg-[#f7efdd]">
                  {iconSrc && (
                    <img alt="" aria-hidden className="size-10 object-contain" src={iconSrc} />
                  )}
                </span>
                <div className="min-w-0">
                  <DialogTitle className="font-display text-2xl font-bold">
                    {hour.canChi}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {hour.range} · {hour.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <p
              aria-label={`${hour.rating} trên ${MAX_RATING} sao`}
              className="flex items-center gap-1"
              role="img"
            >
              {Array.from({ length: MAX_RATING }, (_, index) => (
                <span
                  aria-hidden
                  className={index < hour.rating ? 'text-[#d9ab5c]' : 'text-black/15'}
                  key={index}
                >
                  ★
                </span>
              ))}
            </p>

            <div className="flex flex-col gap-2.5 rounded-lg border border-[#c9a15c]/25 bg-[#fdf9f0] px-4 py-3">
              <DetailRow label="Tinh" text={hour.stars} tone="neutral" />
              <DetailRow label="Nghi" text={hour.favorable} tone="good" />
              <DetailRow label="Kỵ" text={hour.unfavorable} tone="bad" />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
