import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import { toastIconUrl, toastPanelUrl } from '@/config/media';

export type ToastVariant = 'scroll' | 'success' | 'info' | 'warning' | 'error';

interface ToastVariantMeta {
  readonly title: string;
  readonly titleColor: string;
  /** Tông nền dự phòng, khớp panel, để lấp mọi khe khi ảnh panel chưa phủ hết. */
  readonly bg: string;
}

const TOAST_META: Readonly<Record<ToastVariant, ToastVariantMeta>> = {
  scroll: { title: 'Lá số đã sẵn sàng', titleColor: 'var(--color-ink)', bg: 'var(--color-day)' },
  success: { title: 'Thành công', titleColor: 'var(--color-ink)', bg: 'var(--color-day)' },
  info: { title: 'Thông báo', titleColor: 'var(--color-ink)', bg: 'var(--color-day)' },
  warning: { title: 'Lưu ý quan trọng', titleColor: 'var(--color-ink)', bg: 'var(--color-day)' },
  error: { title: 'Có lỗi xảy ra', titleColor: 'var(--destructive)', bg: 'var(--color-day)' },
};

interface ToastCardProps {
  readonly variant: ToastVariant;
  readonly message: string;
  readonly title?: string;
  readonly onClose?: () => void;
  readonly autoCloseMs?: number;
  readonly isPaused?: boolean;
}

type ToastAccentStyle = CSSProperties & { readonly '--toast-accent': string };

/** Toast phong cách phong thủy: nền panel có cảnh núi/mây + icon tròn + tiêu đề + mô tả. */
export function ToastCard({
  variant,
  message,
  title,
  onClose,
  autoCloseMs,
  isPaused = false,
}: ToastCardProps) {
  const meta = TOAST_META[variant];
  const accentStyle: ToastAccentStyle = {
    backgroundColor: meta.bg,
    '--toast-accent': meta.titleColor,
  };

  return (
    <div
      className="relative flex min-h-18 w-full items-center gap-3 overflow-hidden rounded-2xl border border-black/5 py-3 pr-12 pl-3.5 shadow-lg"
      style={accentStyle}
    >
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={toastPanelUrl(variant)}
      />

      <img
        alt=""
        aria-hidden
        className="relative size-11 shrink-0 object-contain drop-shadow-sm"
        src={toastIconUrl(variant)}
      />

      <div className="relative min-w-0 flex-1">
        <p className="truncate text-sm leading-tight font-bold text-(--toast-accent)">
          {title ?? meta.title}
        </p>
        <p className="mt-0.5 text-sm leading-snug text-ink-soft">{message}</p>
      </div>

      <button
        aria-label="Đóng thông báo"
        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-day/80 text-ink-soft shadow-sm ring-1 ring-black/10 backdrop-blur-sm transition-colors outline-none hover:bg-day hover:text-(--toast-accent) focus-visible:ring-2 focus-visible:ring-(--toast-accent)"
        onClick={onClose}
        type="button"
      >
        <X className="size-4" strokeWidth={2.5} />
      </button>

      {autoCloseMs ? (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.75 bg-(--toast-accent)/15">
          <div
            className="h-full origin-left animate-toast-countdown bg-(--toast-accent)"
            data-countdown
            style={{
              animationDuration: `${autoCloseMs}ms`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
