import { rootElement } from './app/root-element';
import { startApp } from './app/start-app';
import { whenFirstPainted } from './app/when-first-painted';

void startApp({
  isPrerendered: () => rootElement().hasChildNodes(),
  whenFirstPainted,
  loadApp: () => import('./bootstrap'),
});
