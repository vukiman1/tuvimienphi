import type { ReactElement } from 'react';
import { Outlet, useMatches } from '@tanstack/react-router';
import { MobileNavBar } from '@/components/layout/mobile-nav-bar';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { StoryProvider } from '@/design-system';

export function SiteLayout(): ReactElement {
  const isStoryPage = useMatches({
    select: (matches) => matches.some((match) => match.staticData.isStoryPage === true),
  });

  return (
    <StoryProvider>
      <div className="flex min-h-screen flex-col overflow-x-clip bg-muted/40">
        <SiteHeader isStoryPage={isStoryPage} />
        <div className="flex-1">
          <Outlet />
        </div>
        <SiteFooter isStoryPage={isStoryPage} />
        <MobileNavBar />
        <div className="box-content h-17 pb-[env(safe-area-inset-bottom)] md:hidden" aria-hidden />
      </div>
    </StoryProvider>
  );
}
