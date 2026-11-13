import type { ReactElement } from 'react';
import { toast, type ToastContentProps } from 'react-toastify/unstyled';
import { ToastCard, ToastVariant } from '@/components/ui/toast-card';

export const TOAST_DURATION_MS = {
  [ToastVariant.Success]: 4000,
  [ToastVariant.Info]: 4000,
  [ToastVariant.Error]: 8000,
} as const satisfies Readonly<Record<ToastVariant, number>>;

function show(variant: ToastVariant, message: string, title?: string): void {
  toast(
    ({ closeToast, toastProps }: ToastContentProps): ReactElement => (
      <ToastCard
        message={message}
        onClose={closeToast}
        onFocusEnter={() => toast.pause({ id: toastProps.toastId })}
        onFocusLeave={() => toast.play({ id: toastProps.toastId })}
        title={title}
        variant={variant}
      />
    ),
    { autoClose: TOAST_DURATION_MS[variant], closeButton: false, icon: false },
  );
}

export const notify = {
  success(message: string, title?: string): void {
    show(ToastVariant.Success, message, title);
  },
  error(message: string, title?: string): void {
    show(ToastVariant.Error, message, title);
  },
  info(message: string, title?: string): void {
    show(ToastVariant.Info, message, title);
  },
};
