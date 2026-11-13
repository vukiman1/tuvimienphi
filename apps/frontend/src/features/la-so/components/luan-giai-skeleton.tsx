import { useEffect, useState, type ReactElement } from 'react';
import { LuanGiaiCard } from '@/features/la-so/components/luan-giai-card';
import { cn } from '@/lib/utils';

const BLOCK_CLASS = 'rounded bg-day-200';
const SWEEP_CLASS = 'animate-ink-sweep motion-reduce:animate-none';

const LINE_WIDTHS = ['w-full', 'w-[96%]', 'w-[88%]', 'w-[93%]', 'w-[62%]'] as const;

const TICK_MS = 1_000;

const KY_VONG_GIAY = 20;
const TRAN_PHAN_TRAM = 90;

const BAT_DAU_DEM_GIAY = 8;

const GIAY_MOI_VACH = 2;

interface LuanGiaiSkeletonCardProps {
  readonly isWriting?: boolean;
}

export function LuanGiaiSkeletonCard({ isWriting }: LuanGiaiSkeletonCardProps): ReactElement {
  const [giay, setGiay] = useState(0);

  useEffect(() => {
    if (!isWriting) return;

    const id = setInterval(() => setGiay((truoc) => truoc + TICK_MS / 1_000), TICK_MS);
    return () => clearInterval(id);
  }, [isWriting]);

  const phanTram = Math.round(TRAN_PHAN_TRAM * (1 - Math.exp(-giay / KY_VONG_GIAY)));
  const soVach = isWriting
    ? Math.min(LINE_WIDTHS.length, 1 + Math.floor(giay / GIAY_MOI_VACH))
    : LINE_WIDTHS.length;

  return (
    <LuanGiaiCard>
      <div aria-label="Đang tải luận giải" role="status">
        {isWriting ? (
          <div className="mb-7">
            <p aria-live="polite" className="text-center text-sm text-ink-soft">
              Đang viết luận giải cho lá số của bạn
              {giay >= BAT_DAU_DEM_GIAY ? <span> · {Math.round(giay)} giây rồi</span> : null}
            </p>
            <p className="mt-1 text-center text-xs text-ink-soft">
              Mỗi bài viết riêng cho lá số này, thường mất 10–40 giây
            </p>

            <div
              aria-label="Tiến trình viết bài"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={phanTram}
              className="mx-auto mt-4 h-1 w-3/5 overflow-hidden rounded-full bg-day-200"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-dusk transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                style={{ width: `${phanTram}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <div
            className={cn(BLOCK_CLASS, SWEEP_CLASS, 'size-16 shrink-0 rounded-full md:size-20')}
          />
          <div className="min-w-0 flex-1">
            <div className={cn(BLOCK_CLASS, SWEEP_CLASS, 'h-3.5 w-28')} />
            <div className={cn(BLOCK_CLASS, SWEEP_CLASS, 'mt-3 h-8 w-3/5 md:h-12')} />
          </div>
        </div>

        <div className={cn(BLOCK_CLASS, SWEEP_CLASS, 'mt-6 h-6 w-3/4')} />

        <div className="mt-8 space-y-3">
          {LINE_WIDTHS.slice(0, soVach).map((width) => (
            <div key={width} className={cn(BLOCK_CLASS, SWEEP_CLASS, 'h-4', width)} />
          ))}
        </div>

        {!isWriting ? (
          <div className="mt-8 space-y-3">
            {LINE_WIDTHS.slice(0, 3).map((width) => (
              <div key={width} className={cn(BLOCK_CLASS, SWEEP_CLASS, 'h-4', width)} />
            ))}
          </div>
        ) : null}
      </div>
    </LuanGiaiCard>
  );
}
