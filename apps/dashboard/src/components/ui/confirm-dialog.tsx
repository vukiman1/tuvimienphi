import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';
import { Button } from './button';

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Xác nhận',
  destructive = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {destructive && (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
            )}
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Huỷ
            </Button>
          </DialogClose>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
