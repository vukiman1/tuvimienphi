import { Link, useRouterState } from '@tanstack/react-router';
import { Home, MessageSquare, Search, UserRound } from 'lucide-react';
import { MEDIA } from '@/config/media';

const NAV_BAR_BG = '#f5f0e6';
const BAR_H = 64;
const SVG_W = 390;
const CIRCLE_R = 32;
const CX = SVG_W / 2;

/*
 * NOTCH_R > CIRCLE_R: a single arc centred at bar-top (y = 0) and radius NOTCH_R.
 * Because the centre is at y = 0, the arc is tangent to the flat bar edge at both
 * end-points — no Q-bezier corners, no "cloud" bumps. The extra (NOTCH_R - CIRCLE_R)
 * pixels on each side are the visible "wings" that show the bar curving down.
 *
 * NOTCH_R is capped so the arc deepest point (y = NOTCH_R) stays above the label
 * (y ≈ CIRCLE_R + 14 = 46 px), leaving the label on solid cream.
 */
const NOTCH_R = 40; // wings = 40 - 32 = 8 px each side
const CIRCLE_TOP = -CIRCLE_R; // = -32 px — circle centre sits exactly at bar top

const NOTCH_FILL = [
  `M 0 0`,
  `L ${CX - NOTCH_R} 0`,
  `A ${NOTCH_R} ${NOTCH_R} 0 0 1 ${CX + NOTCH_R} 0`,
  `L ${SVG_W} 0`,
  `L ${SVG_W} ${BAR_H}`,
  `L 0 ${BAR_H}`,
  `Z`,
].join(' ');

// Same path without the rectangle fill — drawn as a stroke so the curve stays
// visible regardless of what the page renders behind the transparent notch.
const NOTCH_STROKE = [
  `M 0 0`,
  `L ${CX - NOTCH_R} 0`,
  `A ${NOTCH_R} ${NOTCH_R} 0 0 1 ${CX + NOTCH_R} 0`,
  `L ${SVG_W} 0`,
].join(' ');

type MobileNavItem = { label: string; href: string; icon: React.ReactNode };

const LEFT_ITEMS: MobileNavItem[] = [
  { label: 'Trang chủ', href: '/', icon: <Home strokeWidth={1.5} className="size-[18px]" /> },
  {
    label: 'Khám phá',
    href: '/kien-thuc',
    icon: <Search strokeWidth={1.5} className="size-[18px]" />,
  },
];

const RIGHT_ITEMS: MobileNavItem[] = [
  {
    label: 'Thông báo',
    href: '/thong-bao',
    icon: (
      <span className="relative">
        <MessageSquare strokeWidth={1.5} className="size-[18px]" />
        <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-red-500" />
      </span>
    ),
  },
  {
    label: 'Cá nhân',
    href: '/dashboard/settings',
    icon: <UserRound strokeWidth={1.5} className="size-[18px]" />,
  },
];

function NavItem({ item, isActive }: { item: MobileNavItem; isActive: boolean }) {
  return (
    <Link
      to={item.href}
      aria-current={isActive ? 'page' : undefined}
      className="flex flex-1 flex-col items-center justify-center gap-[3px] no-underline transition-colors"
      style={{ height: BAR_H }}
    >
      {/* key remounts the span each time this tab becomes active → replays spring */}
      <span
        key={isActive ? 'active' : 'idle'}
        className={`flex items-center justify-center overflow-visible ${isActive ? 'nav-icon-spring text-[#7a5228]' : 'text-[#a8957e]'}`}
        style={{ width: 18, height: 18 }}
      >
        {item.icon}
      </span>
      <span
        className={`font-body text-[10px] tracking-wide ${isActive ? 'font-semibold text-[#7a5228]' : 'font-medium text-[#a8957e]'}`}
      >
        {item.label}
      </span>
      <span
        className={`size-1 rounded-full transition-colors ${isActive ? 'bg-[#c9a15c]' : 'bg-transparent'}`}
        aria-hidden
      />
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="relative" style={{ height: BAR_H }}>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${SVG_W} ${BAR_H}`}
          preserveAspectRatio="none"
          style={{ filter: 'drop-shadow(0 -2px 6px rgba(0,0,0,0.12))' }}
        >
          <path d={NOTCH_FILL} fill={NAV_BAR_BG} />
          <path d={NOTCH_STROKE} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" />
        </svg>

        <div className="relative flex h-full items-stretch">
          <div className="flex flex-1">
            {LEFT_ITEMS.map((item) => (
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
            ))}
          </div>
          <div style={{ width: CIRCLE_R * 2 }} className="shrink-0" />
          <div className="flex flex-1">
            {RIGHT_ITEMS.map((item) => (
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
            ))}
          </div>
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" style={{ backgroundColor: NAV_BAR_BG }} />

      <Link
        to="/la-so"
        aria-label="Lập lá số"
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center no-underline"
        style={{ top: CIRCLE_TOP }}
      >
        <span
          className="flex items-center justify-center rounded-full"
          style={{
            width: CIRCLE_R * 2,
            height: CIRCLE_R * 2,
            background: 'linear-gradient(145deg, #f0e2b0 0%, #d9b96e 100%)',
            boxShadow: '0 0 0 3px #fff, 0 2px 12px rgba(0,0,0,0.18)',
          }}
        >
          <img
            src={MEDIA.navBar.bagua}
            alt=""
            aria-hidden
            style={{ width: CIRCLE_R * 1.45, height: CIRCLE_R * 1.45 }}
            className="object-contain nav-bagua-spin"
          />
        </span>
        {/* Label gets a cream bg so it stays readable even over the transparent notch */}
        <span
          className={`mt-1 rounded-sm px-1 font-body text-[10px] tracking-wide ${isActive('/la-so') ? 'font-bold text-[#7a5228]' : 'font-semibold text-[#a8957e]'}`}
          style={{ backgroundColor: NAV_BAR_BG }}
        >
          Lập lá số
        </span>
      </Link>
    </nav>
  );
}
