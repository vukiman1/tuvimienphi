const SPLASH_MIN_VISIBLE_MS = 1200;
const SPLASH_FADE_MS = 400;

export function dismissSplash(): void {
  const splash = document.getElementById('app-splash');
  if (!splash) {
    return;
  }

  const remaining = Math.max(0, SPLASH_MIN_VISIBLE_MS - performance.now());
  window.setTimeout(() => {
    splash.classList.add('app-splash--hidden');
    window.setTimeout(() => splash.remove(), SPLASH_FADE_MS);
  }, remaining);
}
