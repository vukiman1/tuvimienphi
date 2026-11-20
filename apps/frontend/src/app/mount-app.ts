import type { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { isPrerendered } from './is-prerendered';

export interface MountOptions {
  readonly onRecoverableError: (error: unknown) => void;
}

export function mountApp(container: Element, app: ReactNode, options: MountOptions): void {
  if (isPrerendered(container)) {
    hydrateRoot(container, app, { onRecoverableError: options.onRecoverableError });
    return;
  }
  createRoot(container, { onRecoverableError: options.onRecoverableError }).render(app);
}
