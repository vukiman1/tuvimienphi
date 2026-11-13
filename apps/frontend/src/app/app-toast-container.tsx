import type { ReactElement } from 'react';
import { ToastContainer } from 'react-toastify/unstyled';
import { FOCUS_RING_CLASS } from '@/design-system';
import { TOAST_TRANSITION } from '@/lib/toast-transition';
import { cn } from '@/lib/utils';

const VISIBLE_TOAST_LIMIT = 3;
const TOAST_WRAPPER_CLASS = cn('relative w-full touch-none rounded-2xl', FOCUS_RING_CLASS);

function toastWrapperClass(): string {
  return TOAST_WRAPPER_CLASS;
}

export function AppToastContainer(): ReactElement {
  return (
    <ToastContainer
      closeOnClick
      hideProgressBar
      limit={VISIBLE_TOAST_LIMIT}
      newestOnTop={false}
      position="bottom-center"
      role={undefined}
      toastClassName={toastWrapperClass}
      transition={TOAST_TRANSITION}
    />
  );
}
