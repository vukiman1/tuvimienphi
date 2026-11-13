import type { FocusEvent, ReactElement } from 'react';
import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';

export enum ToastVariant {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

type ToastRole = 'alert' | 'status';

interface ToastVariantStyle {
  readonly icon: LucideIcon;
  readonly iconClass: string;
  readonly role: ToastRole;
}

const TOAST_VARIANT_STYLE = {
  [ToastVariant.Success]: {
    icon: CircleCheck,
    iconClass: 'bg-gold/20 text-hanh-tho',
    role: 'status',
  },
  [ToastVariant.Error]: { icon: CircleAlert, iconClass: 'bg-ember/15 text-danger', role: 'alert' },
  [ToastVariant.Info]: { icon: Info, iconClass: 'bg-deep/10 text-deep', role: 'status' },
} as const satisfies Readonly<Record<ToastVariant, ToastVariantStyle>>;

interface ToastCardProps {
  readonly variant: ToastVariant;
  readonly message: string;
  readonly title?: string;
  readonly onClose?: () => void;
  readonly onFocusEnter?: () => void;
  readonly onFocusLeave?: () => void;
}

export function ToastCard({
  variant,
  message,
  title,
  onClose,
  onFocusEnter,
  onFocusLeave,
}: ToastCardProps): ReactElement {
  const { icon: Icon, iconClass, role } = TOAST_VARIANT_STYLE[variant];

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onFocusLeave?.();
  }

  return (
    <div
      className="flex min-h-14 w-full max-w-sm items-start gap-3 rounded-2xl border border-ink/10 bg-day px-4 py-3 text-ink shadow-lg"
      onBlur={handleBlur}
      onFocus={onFocusEnter}
      role={role}
    >
      <span
        aria-hidden
        className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', iconClass)}
      >
        <Icon className="size-4.5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1 py-1.5 text-sm leading-snug">
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        <p className={title ? 'text-ink-soft' : 'text-ink'}>{message}</p>
      </div>

      <button
        aria-label="Đóng thông báo"
        className={cn(
          '-m-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink',
          FOCUS_RING_CLASS,
        )}
        onClick={onClose}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
