import { StrictMode } from 'react';
import App from './app/app';
import { exposeRootMarkup } from './app/expose-root-markup';
import { mountApp } from './app/mount-app';
import { renderAfterFirstLoad } from './app/render-after-first-load';
import { router } from './app/router';
import { ErrorBoundary } from '@/components/error-boundary';
import { RootErrorFallback } from '@/features/error/root-error-fallback';
import { initErrorReporting } from '@/lib/error-reporting';
import { dismissSplash } from '@/lib/splash';

const ROOT_ID = 'root';

class MissingRootElementError extends Error {
  constructor() {
    super(`index.html has no #${ROOT_ID} element to mount the app into`);
    this.name = 'MissingRootElementError';
  }
}

function rootElement(): HTMLElement {
  const element = document.getElementById(ROOT_ID);
  if (!element) {
    throw new MissingRootElementError();
  }
  return element;
}

void initErrorReporting();

document.documentElement.dataset.motion = 'ready';

const app = (
  <StrictMode>
    <ErrorBoundary fallback={RootErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

exposeRootMarkup(app, ROOT_ID);

function renderApp(): void {
  mountApp(rootElement(), app);
  dismissSplash();
}

void renderAfterFirstLoad(router, renderApp);
