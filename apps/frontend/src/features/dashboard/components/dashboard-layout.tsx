import { type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Settings, Bell, Monitor, ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { MEDIA } from '@/config/media';
import { cn } from '@/lib/utils';
import { DashboardPageHeader } from './dashboard-page-header';

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
}

const ACCOUNT_NAV: NavItem[] = [
  {
    href: '/dashboard/settings',
    label: 'Cài đặt',
    description: 'Quản lý thông tin tài khoản và bảo mật của bạn',
    icon: <Settings className="size-4" />,
  },
  {
    href: '/dashboard/sessions',
    label: 'Phiên đăng nhập',
    description: 'Xem và đăng xuất các thiết bị đang truy cập tài khoản của bạn',
    icon: <Monitor className="size-4" />,
  },
  {
    href: '/dashboard/notifications',
    label: 'Thông báo',
    description: 'Những thông báo mới nhất về tài khoản của bạn',
    icon: <Bell className="size-4" />,
  },
];

function isNavItemActive(item: NavItem, pathname: string): boolean {
  return (
    pathname === item.href || (item.href === '/dashboard/settings' && pathname === '/dashboard')
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const openItem = ACCOUNT_NAV.find((item) => isNavItemActive(item, pathname)) ?? ACCOUNT_NAV[0];

  return (
    <div className="min-h-screen bg-[#FDF9F4]">
      <SiteHeader />

      <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
        <DashboardPageHeader title={openItem.label} description={openItem.description} />

        <div className="flex gap-8">
          <aside className="sticky top-10 hidden w-[252px] shrink-0 flex-col self-start overflow-hidden rounded-2xl border border-[#c9a15c]/20 bg-white/70 shadow-sm md:flex">
            <div className="p-5">
              <Button
                variant="outline"
                asChild
                className="mb-6 w-fit gap-2 border-[#c9a15c]/40 text-[#5c4a3d] hover:bg-[#c9a15c]/10"
              >
                <Link to="/">
                  <ArrowLeft className="size-4" />
                  Về trang chủ
                </Link>
              </Button>

              <nav>
                <h3 className="mb-3 px-3 font-label text-xs tracking-wider text-muted-foreground/70 uppercase">
                  Tài khoản
                </h3>
                <div className="space-y-1">
                  {ACCOUNT_NAV.map((item) => {
                    const isActive = isNavItemActive(item, pathname);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                          isActive
                            ? 'bg-[#f4ebe1] text-[#904423]'
                            : 'text-[#6b5a4e] hover:bg-[#f4ebe1]/50 hover:text-[#904423]',
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            <div className="relative mt-6 h-[180px] overflow-hidden">
              <img
                src={MEDIA.home.decorPhongCanh}
                alt=""
                aria-hidden
                className="absolute -bottom-6 -left-6 w-[130%] max-w-none opacity-25 mix-blend-multiply"
              />
              <div className="absolute inset-x-0 top-0 z-10 flex items-end gap-2 px-5">
                <div>
                  <p className="font-display text-base italic text-[#904423] opacity-80">
                    Hiểu mình
                  </p>
                  <p className="font-display text-base italic text-[#904423] opacity-80">
                    Sống an nhiên
                  </p>
                </div>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-[#b44131] font-seal text-[10px] text-white">
                  觀
                </span>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
