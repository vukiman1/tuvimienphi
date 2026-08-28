import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

/**
 * Subtle desktop mouse parallax. Writes the normalized pointer offset (-1..1) to the CSS variables
 * `--kt-mx` / `--kt-my` on the returned ref's element, throttled through requestAnimationFrame;
 * layers inside read the vars to drift a few pixels. No-op on coarse pointers (touch) and when the
 * visitor prefers reduced motion.
 */
export function useHeroParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Pause the hero's ambient loops while it's scrolled out of view — no wasted off-screen work.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle('kt-paused', !entry?.isIntersecting),
      { rootMargin: '80px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      el.style.setProperty('--kt-mx', mx.toFixed(3));
      el.style.setProperty('--kt-my', my.toFixed(3));
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      my = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      schedule();
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
      schedule();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return ref;
}
