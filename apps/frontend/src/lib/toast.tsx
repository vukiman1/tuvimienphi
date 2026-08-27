import { toast } from 'react-toastify';
import { ToastCard, type ToastVariant } from '@/components/ui/toast-card';

const AUTO_CLOSE_MS = 4000;

interface NotifyOptions {
  /** Ghi đè tiêu đề mặc định của loại toast. */
  readonly title?: string;
  readonly autoClose?: number;
}

function show(variant: ToastVariant, message: string, options?: NotifyOptions) {
  toast(
    ({ closeToast }) => (
      <ToastCard message={message} onClose={closeToast} title={options?.title} variant={variant} />
    ),
    {
      autoClose: options?.autoClose ?? AUTO_CLOSE_MS,
      icon: false,
      closeButton: false,
      className: 'ec-toast',
    },
  );
}

/**
 * One place to raise user-facing feedback, so callers do not each pick their own wording style or
 * duration. Errors stay up longer than confirmations because they usually need reading twice.
 */
export const notify = {
  success(message: string, title?: string) {
    show('success', message, { title, autoClose: AUTO_CLOSE_MS });
  },
  error(message: string, title?: string) {
    show('error', message, { title, autoClose: AUTO_CLOSE_MS * 2 });
  },
  info(message: string, title?: string) {
    show('info', message, { title });
  },
  warning(message: string, title?: string) {
    show('warning', message, { title });
  },
  /** Thông báo đặc biệt (cuộn lá số) — ví dụ "Lá số đã sẵn sàng". */
  laso(message: string, title?: string) {
    show('scroll', message, { title });
  },
};
