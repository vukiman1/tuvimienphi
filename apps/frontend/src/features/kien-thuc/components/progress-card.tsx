import { useId, type ReactElement } from 'react';
import { CtaButton, CtaTone, FOCUS_RING_CLASS } from '@/design-system';
import { preloadAuthModal } from '@/features/auth/lazy-auth-modal';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  readonly readCount: number;
  readonly totalCount: number;
  readonly onSignIn: () => void;
  readonly onSnooze: () => void;
}

export function ProgressCard({
  readCount,
  totalCount,
  onSignIn,
  onSnooze,
}: ProgressCardProps): ReactElement {
  const labelId = useId();
  return (
    <aside
      aria-labelledby={labelId}
      className="rounded-2xl border border-ink/15 bg-day-200 p-5 text-ink md:p-6"
    >
      <p id={labelId} className="font-display text-xl font-extrabold">
        {`Bạn đã đọc ${readCount}/${totalCount} bài.`}
      </p>
      <p className="mt-2 text-base">Đăng nhập để giữ tiến độ và học tiếp trên mọi thiết bị.</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <span
          className="inline-flex"
          onFocusCapture={preloadAuthModal}
          onMouseEnter={preloadAuthModal}
        >
          <CtaButton tone={CtaTone.Gold} onClick={onSignIn}>
            Đăng nhập
          </CtaButton>
        </span>
        <button
          type="button"
          onClick={onSnooze}
          className={cn(
            'min-h-11 px-2 text-sm font-semibold text-ink underline underline-offset-4',
            FOCUS_RING_CLASS,
          )}
        >
          Để sau
        </button>
      </div>
    </aside>
  );
}
