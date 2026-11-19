import { StrictMode } from 'react';
import App from './app/app';
import { AppMountedMarker } from './app/app-mounted-marker';
import { exposeRootMarkup } from './app/expose-root-markup';
import { mountApp } from './app/mount-app';
import { renderAfterFirstLoad } from './app/render-after-first-load';
import { reportRecoverableError } from './app/report-recoverable-error';
import { ROOT_ID, rootElement } from './app/root-element';
import { router } from './app/router';
import { ErrorBoundary } from '@/components/error-boundary';
import { RootErrorFallback } from '@/features/error/root-error-fallback';
import { initErrorReporting } from '@/lib/error-reporting';
import { dismissSplash } from '@/lib/splash';

void initErrorReporting();

document.documentElement.dataset.motion = 'ready';

const app = (
  <StrictMode>
    <ErrorBoundary fallback={RootErrorFallback}>
      <App />
    </ErrorBoundary>
    <AppMountedMarker />
  </StrictMode>
);

exposeRootMarkup(app, ROOT_ID);

function renderApp(): void {
  mountApp(rootElement(), app, { onRecoverableError: reportRecoverableError });
  dismissSplash();
}

void renderAfterFirstLoad(router, renderApp);
