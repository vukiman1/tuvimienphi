import { isPrerendered } from './app/is-prerendered';
import { rootElement } from './app/root-element';
import { startApp } from './app/start-app';
import { whenFirstPainted } from './app/when-first-painted';

const START_FAILED_MESSAGE = 'Could not start the app on this page';

void startApp({
  isPrerendered: () => isPrerendered(rootElement()),
  whenFirstPainted,
  loadApp: () => import('./bootstrap'),
}).catch((error: unknown) => {
  console.error(START_FAILED_MESSAGE, window.location.pathname, error);
  throw error;
});
