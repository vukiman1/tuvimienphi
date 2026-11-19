import type { ReactNode } from 'react';

declare global {
  interface Window {
    renderRootMarkup?: () => Promise<string>;
  }
}

export function exposeRootMarkup(app: ReactNode, rootId: string): void {
  window.renderRootMarkup = async (): Promise<string> => {
    const { renderRootMarkup } = await import('./render-root-markup');
    return renderRootMarkup(app, rootId);
  };
}
