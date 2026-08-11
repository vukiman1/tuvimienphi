import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@tanstack/react-router';

const MIN_VISIBLE_MS = 700;

export function NavigationProgress() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const shownAtRef = useRef(0);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const unsubscribeStart = router.subscribe('onBeforeNavigate', (event) => {
      if (event.toLocation.pathname === event.fromLocation?.pathname) {
        return;
      }
      clearHideTimer();
      shownAtRef.current = performance.now();
      setIsVisible(true);
    });

    const unsubscribeEnd = router.subscribe('onResolved', () => {
      const elapsed = performance.now() - shownAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(() => setIsVisible(false), remaining);
    });

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
      clearHideTimer();
    };
  }, [router]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Đang chuyển trang"
      className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
    >
      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#e8c987] to-[#c9a15c] animate-[nav-progress_1.2s_ease-in-out_infinite] motion-reduce:animate-none" />
    </div>
  );
}
