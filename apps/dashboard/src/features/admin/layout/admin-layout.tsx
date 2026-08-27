import type { ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AdminLayout({ children }: { children: ReactNode }) {
  // Key the content by path so each navigation replays the enter animation.
  const { pathname } = useLocation();

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Fixed constellation backdrop; every surface above is translucent glass. */}
      <div className="night-sky" aria-hidden="true" />

      <Sidebar className="relative z-10 hidden lg:flex" />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="page-enter mx-auto w-full max-w-7xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
