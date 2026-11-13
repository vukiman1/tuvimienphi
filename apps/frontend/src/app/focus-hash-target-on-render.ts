import type { AnyRouter } from '@tanstack/react-router';

export function focusHashTargetOnRender(router: AnyRouter): void {
  router.subscribe('onRendered', ({ toLocation }) => {
    if (toLocation.hash === '') {
      return;
    }
    document.getElementById(toLocation.hash)?.focus({ preventScroll: true });
  });
}
