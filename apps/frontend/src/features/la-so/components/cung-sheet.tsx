import type { ReactElement, ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';

interface CungSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onStep: (step: 1 | -1) => void;
  readonly onCloseFocus: () => void;
  readonly children: ReactNode;
  readonly title: string;
}

const ICON_BUTTON_CLASS = cn(
  'flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5',
  FOCUS_RING_CLASS,
);

export function CungSheet({
  open,
  onOpenChange,
  onStep,
  onCloseFocus,
  children,
  title,
}: CungSheetProps): ReactElement {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-night/60 data-[state=closed]:animate-backdrop-out data-[state=open]:animate-backdrop-in"
          data-slot="modal-backdrop"
        />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-sheet overflow-y-auto rounded-t-2xl bg-day p-6 text-ink data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in"
          data-slot="sheet"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onCloseFocus();
          }}
        >
          <div className="mb-4 flex items-center gap-1">
            <Dialog.Title asChild>
              <p className="flex-1 text-sm font-bold tracking-widest text-ink-soft uppercase">
                {title}
              </p>
            </Dialog.Title>
            <button
              aria-label="Cung trước"
              className={ICON_BUTTON_CLASS}
              onClick={() => onStep(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              aria-label="Cung sau"
              className={ICON_BUTTON_CLASS}
              onClick={() => onStep(1)}
              type="button"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
            <Dialog.Close aria-label="Đóng" className={ICON_BUTTON_CLASS}>
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>
          <div className="pb-[env(safe-area-inset-bottom)]">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
