import type { ReactElement } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ConfirmOptions } from './confirm-dialog';

export interface ConfirmAlertDialogProps {
  readonly options: ConfirmOptions;
  readonly isOpen: boolean;
  readonly onSettle: (isConfirmed: boolean) => void;
}

export function ConfirmAlertDialog({
  options,
  isOpen,
  onSettle,
}: ConfirmAlertDialogProps): ReactElement {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onSettle(false)}>
      <AlertDialogContent>
        <AlertDialogTitle>{options.title}</AlertDialogTitle>
        <AlertDialogDescription>{options.description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button onClick={() => onSettle(false)} type="button" variant="ghost">
              {options.cancelLabel ?? 'Cancel'}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => onSettle(true)}
              type="button"
              variant={options.destructive ? 'destructive' : 'default'}
            >
              {options.confirmLabel ?? 'Confirm'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
