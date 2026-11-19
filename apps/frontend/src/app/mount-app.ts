import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

export function mountApp(container: Element, app: ReactNode): void {
  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
    return;
  }
  createRoot(container).render(app);
}
