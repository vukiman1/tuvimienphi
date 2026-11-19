import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { renderAfterFirstLoad } from './app/render-after-first-load';
import { router } from './app/router';
import { ErrorBoundary } from '@/components/error-boundary';
import { RootErrorFallback } from '@/features/error/root-error-fallback';
import { initErrorReporting } from '@/lib/error-reporting';
import { dismissSplash } from '@/lib/splash';

void initErrorReporting();

document.documentElement.dataset.motion = 'ready';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function renderApp(): void {
  root.render(
    <StrictMode>
      <ErrorBoundary fallback={RootErrorFallback}>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  dismissSplash();
}

void renderAfterFirstLoad(router, renderApp);
