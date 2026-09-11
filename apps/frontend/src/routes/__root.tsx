import { Suspense, lazy, useEffect, useState } from 'react';
import { HeadContent, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { ErrorPage } from '@/features/error/error-page';
import { NotFoundPage } from '@/features/error/not-found-page';
import { AuthModal } from '@/features/auth/auth-modal';
import { GoogleOneTap } from '@/features/auth/google-one-tap';
import { useSyncLaSoHistoryOnLogin } from '@/features/la-so/history/use-sync-on-login';
import { SITE_NAME, jsonLdMeta, organizationJsonLd, seo } from '@/lib/seo';

export interface RouterContext {
  queryClient: QueryClient;
}

const QueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((module) => ({
          default: module.ReactQueryDevtools,
        })),
      )
    : () => null;

// Declared on the root so the auth modal can open over any page, whatever route the user is on.
const rootSearchSchema = z.object({
  auth: z.enum(['login', 'register']).optional(),
  redirect: z.string().optional(),
});

export type RootSearch = z.infer<typeof rootSearchSchema>;

// Site-wide defaults. Any route that declares its own `head` overrides these; routes without one
// still inherit sensible tags plus the Organization JSON-LD that should appear on every page.
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
  validateSearch: rootSearchSchema,
  head: () => {
    const base = seo({
      title: `${SITE_NAME} — Xem tử vi, lá số, ngày tốt online`,
      titleExact: true,
      description:
        'Xem tử vi miễn phí, lập lá số tử vi, tra ngày tốt xấu và vận hạn theo năm. Luận giải chi tiết, dễ hiểu cho người mới.',
      path: '/',
      // The leaf route owns the canonical; the root only supplies fallback meta + Organization JSON-LD.
      canonical: false,
    });
    return { ...base, meta: [...base.meta, jsonLdMeta(organizationJsonLd())] };
  },
});

function RootRoute() {
  useSyncLaSoHistoryOnLogin();
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <HeadContent />
      <GoogleOneTap />
      <AuthModal />
      <Outlet />
      {isDesktop && (
        <Suspense>
          <QueryDevtools buttonPosition="bottom-right" />
        </Suspense>
      )}
    </>
  );
}
