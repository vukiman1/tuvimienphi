import { useCallback } from 'react';
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { isInternalPath } from './route-guards';

export type AuthModalView = 'login' | 'register';

interface AuthModalSearch {
  auth?: AuthModalView;
  redirect?: string;
}

/**
 * The modal is driven by the `auth` search param, so it survives a reload, closes with the back
 * button, and can be linked to. `redirect` carries the page a guard bounced the user away from.
 */
export function useAuthModal() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = useSearch({ strict: false }) as AuthModalSearch;

  const open = useCallback(
    (view: AuthModalView) =>
      navigate({
        to: '.',
        resetScroll: false,
        search: (previous) => ({ ...previous, auth: view }),
      }),
    [navigate],
  );

  const close = useCallback(
    () =>
      navigate({
        to: '.',
        resetScroll: false,
        search: (previous) => {
          const next = { ...(previous as Record<string, unknown>) };
          delete next.auth;
          delete next.redirect;
          return next;
        },
      }),
    [navigate],
  );

  const finish = useCallback(async (): Promise<void> => {
    const { auth, redirect } = router.state.location.search as AuthModalSearch;
    if (isInternalPath(redirect)) {
      await navigate({ to: redirect as never });
      return;
    }
    if (auth) {
      await close();
    }
  }, [router, navigate, close]);

  return { view: search.auth ?? null, redirect: search.redirect, open, close, finish };
}
