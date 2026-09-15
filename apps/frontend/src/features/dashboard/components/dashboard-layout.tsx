import { type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Settings, Bell, Monitor, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MEDIA } from '@/config/media';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const ACCOUNT_NAV: NavItem[] = [
  { href: '/dashboard/settings', label: 'Cài đặt', icon: <Settings className="size-4" /> },
  { href: '/dashboard/sessions', label: 'Phiên đăng nhập', icon: <Monitor className="size-4" /> },
  { href: '/dashboard/notifications', label: 'Thông báo', icon: <Bell className="size-4" /> },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex min-h-screen bg-[#FDF9F4]">
      {/* Sidebar */}
      <aside className="relative hidden w-[260px] flex-col border-r border-[#c9a15c]/20 bg-[#FDF9F4] md:flex">
        <div className="p-6">
          <Button
            variant="outline"
            asChild
            className="mb-8 w-fit gap-2 border-[#c9a15c]/40 text-[#5c4a3d] hover:bg-[#c9a15c]/10"
          >
            <Link to="/">
              <ArrowLeft className="size-4" />
              Về trang chủ
            </Link>
          </Button>

          <nav className="space-y-6">
            <div>
              <h3 className="mb-3 px-3 font-label text-xs tracking-wider text-muted-foreground/70 uppercase">
                Tài khoản
              </h3>
              <div className="space-y-1">
                {ACCOUNT_NAV.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === '/dashboard/settings' && pathname === '/dashboard');
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
            </div>
          </nav>
        </div>

        {/* Bottom Graphic */}
        <div className="relative mt-auto h-[240px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F4] via-transparent to-transparent z-10" />
          <img
            src={MEDIA.home.decorPhongCanh}
            alt="Decor"
            className="absolute -bottom-8 -left-4 w-[120%] max-w-none opacity-40 mix-blend-multiply"
          />
          <div className="absolute bottom-12 left-6 z-20">
            <p className="font-display text-lg italic text-[#904423] opacity-80">Hiểu mình</p>
            <p className="font-display text-lg italic text-[#904423] opacity-80">Sống an nhiên</p>
            <div className="mt-1 flex items-center justify-end pr-2">
              <span className="flex size-6 items-center justify-center rounded-sm bg-[#b44131] font-seal text-xs text-white">
                觀
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
