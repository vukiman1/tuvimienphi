import { Link, useRouterState } from '@tanstack/react-router';
import { NavigationProgress } from '@/components/layout/navigation-progress';
import { UserMenu } from '@/components/layout/user-menu';
import { useAuthModal } from '@/features/auth/use-auth-modal';
import { appConfig } from '@/config/app-config';
import { selectIsInitializing, selectUser, useAuthStore } from '@/stores/auth-store';

const NAV_ITEMS = [
  { label: 'Lá Số', href: '/la-so' },
  { label: 'Lịch Âm', href: '/lich-am' },
  { label: 'Ngày Tốt', href: '/ngay-tot' },
  { label: 'Gieo Quẻ', href: '/gieo-que' },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

const HEADER_GRADIENT = 'linear-gradient(110deg, #131315 0%, #35332e 55%, #17171a 100%)';

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      to={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={`relative shrink-0 pb-1 text-xs font-medium tracking-wide whitespace-nowrap no-underline transition-colors md:text-sm after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[#c9a15c] after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none ${
        isActive ? 'text-[#e5c886] after:scale-x-100' : 'text-[#a6a6ab] hover:text-[#e5c886]'
      }`}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const { open: openAuth } = useAuthModal();
  const user = useAuthStore(selectUser);
  const isInitializing = useAuthStore(selectIsInitializing);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isItemActive = (item: NavItem): boolean =>
    pathname.startsWith(item.href) || (pathname === '/' && item === NAV_ITEMS[0]);

  return (
    <header
      className="relative border-b border-[#c9a15c]/25"
      style={{ background: HEADER_GRADIENT }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 md:px-6">
        <Link className="flex shrink-0 items-center no-underline" to="/">
          <img src="/logo.png" alt={appConfig.app.name} className="h-7 w-auto md:h-10" />
        </Link>

        <nav
          className="order-last flex w-full items-center justify-between gap-4 overflow-x-auto border-t border-[#c9a15c]/15 px-1 pt-2 pb-1 md:order-none md:w-auto md:justify-start md:gap-9 md:overflow-visible md:border-t-0 md:p-0"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} isActive={isItemActive(item)} />
          ))}
        </nav>

        <div className="inline-flex min-h-9 shrink-0 items-center gap-3" aria-busy={isInitializing}>
          {isInitializing ? (
            <span className="text-sm text-[#a6a6ab]" role="status">
              Loading session...
            </span>
          ) : user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => openAuth('login')}
              type="button"
              className="rounded-full border border-[#c9a15c]/70 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#ecd9a8] md:px-5 md:py-1.5 md:text-xs md:tracking-[0.18em] transition-colors hover:bg-[#c9a15c]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a15c]"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
      <NavigationProgress />
    </header>
  );
}
