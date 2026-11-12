export function focusHashTarget(hash: string | undefined): void {
  if (hash === undefined) {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(hash)?.focus({ preventScroll: true });
  });
}
