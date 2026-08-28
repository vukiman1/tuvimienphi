import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element the first time it scrolls into view. Returns a ref to attach and a `revealed`
 * flag — pair it with an opacity/translate transition for a subtle one-shot scroll reveal. Falls
 * back to visible when IntersectionObserver is unavailable (SSR/old browsers).
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  // Start revealed when IntersectionObserver is unavailable, so nothing stays hidden.
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return { ref, revealed };
}
