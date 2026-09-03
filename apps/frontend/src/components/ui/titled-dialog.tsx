import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TitledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Extra classes for the panel, e.g. a wider `max-w-*` than the default. */
  className?: string;
}

/**
 * The header shell every settings dialog shares: a titled, described modal whose body Radix
 * unmounts on close. Callers own the body (its form, mutation, or content) — this only removes the
 * repeated Dialog/Content/Header scaffolding so those files show what is actually different.
 */
export function TitledDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: TitledDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
