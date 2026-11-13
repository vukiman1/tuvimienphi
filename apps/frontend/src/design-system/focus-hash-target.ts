const HASH_TARGET_WAIT_MS = 3000;

export function focusHashTarget(hash: string | undefined): void {
  if (hash === undefined) {
    return;
  }
  const deadline = performance.now() + HASH_TARGET_WAIT_MS;
  const focusWhenMounted = (): void => {
    const target = document.getElementById(hash);
    if (target !== null) {
      target.focus({ preventScroll: true });
      return;
    }
    if (performance.now() < deadline) {
      window.requestAnimationFrame(focusWhenMounted);
    }
  };
  window.requestAnimationFrame(focusWhenMounted);
}
