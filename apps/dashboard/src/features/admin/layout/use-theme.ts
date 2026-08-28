import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';
export const THEME_KEY = 'tuvi-admin-theme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(THEME_KEY, theme);
}

/** Read/toggle the theme. The initial class is set by an inline script in index.html (no flash), so
 *  this hook just mirrors and flips it — no mount-time effect that could cause a cascading render. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      apply(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
