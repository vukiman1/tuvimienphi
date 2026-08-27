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
  scroll: { title: 'Lá số đã sẵn sàng', titleColor: '#9a6a22', bg: '#fbf3e2' },
  success: { title: 'Thành công', titleColor: '#2f7d3f', bg: '#eef6ec' },
  info: { title: 'Thông báo', titleColor: '#2a5aa8', bg: '#eef2fb' },
  warning: { title: 'Lưu ý quan trọng', titleColor: '#c07d1e', bg: '#fdf4e2' },
  error: { title: 'Có lỗi xảy ra', titleColor: '#b93a2f', bg: '#fbecec' },
};

interface ToastCardProps {
  readonly variant: ToastVariant;
  readonly message: string;
  readonly title?: string;
  readonly onClose?: () => void;
}

/** Toast phong cách phong thủy: nền panel có cảnh núi/mây + icon tròn + tiêu đề + mô tả. */
export function ToastCard({ variant, message, title, onClose }: ToastCardProps) {
  const meta = TOAST_META[variant];

  return (
    <div
      className="relative flex min-h-[104px] w-full items-center gap-3 overflow-hidden rounded-2xl border border-black/5 px-4 py-3 font-body shadow-[0_10px_28px_rgba(60,40,15,0.16)]"
      style={{ backgroundColor: meta.bg }}
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
        className="relative size-12 shrink-0 object-contain drop-shadow-sm"
        src={toastIconUrl(variant)}
      />

      <div className="relative min-w-0 flex-1">
        <p
          className="font-display text-base leading-snug font-bold"
          style={{ color: meta.titleColor }}
        >
          {title ?? meta.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[#4a4235]">{message}</p>
      </div>

      <div className="relative flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
        <span className="text-xs whitespace-nowrap text-[#8a8272]">Vừa xong</span>
        <button
          aria-label="Đóng thông báo"
          className="text-[#8a8272] transition-colors hover:text-[#4a4235]"
          onClick={onClose}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
