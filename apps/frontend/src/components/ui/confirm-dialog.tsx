import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { lazyRouteComponent } from '@tanstack/react-router';
import type { ConfirmAlertDialogProps } from './confirm-alert-dialog';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface ConfirmAlertDialogModule {
  readonly ConfirmAlertDialog: (props: ConfirmAlertDialogProps) => ReactElement;
}

function importConfirmAlertDialog(): Promise<ConfirmAlertDialogModule> {
  return import('./confirm-alert-dialog');
}

const ConfirmAlertDialog = lazyRouteComponent(importConfirmAlertDialog, 'ConfirmAlertDialog');

/** Hosts the app's one confirmation dialog so callers get `await confirm(...)` and render nothing. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  // reason: the context value must keep a stable identity or every consumer re-renders on each open
  const confirm = useCallback<ConfirmFn>(
    (next) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setOptions(next);
        setIsOpen(true);
      }),
    [],
  );

  // `options` survives settling: Radix animates the close, and clearing it would blank the dialog.
  const settle = (confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Suspense fallback={null}>
          <ConfirmAlertDialog isOpen={isOpen} onSettle={settle} options={options} />
        </Suspense>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used inside <ConfirmProvider>');
  }
  return confirm;
}
