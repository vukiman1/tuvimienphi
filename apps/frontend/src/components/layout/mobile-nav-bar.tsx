import { Link, useRouterState } from '@tanstack/react-router';
import { Home, MessageSquare, Search, UserRound } from 'lucide-react';
import { FOCUS_RING_CLASS, LogoMark } from '@/design-system';
import { cn } from '@/lib/utils';

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
  { label: 'Trang chủ', href: '/', icon: <Home strokeWidth={1.5} className="size-4.5" /> },
  {
    label: 'Khám phá',
    href: '/kien-thuc',
    icon: <Search strokeWidth={1.5} className="size-4.5" />,
  },
];

const RIGHT_ITEMS: MobileNavItem[] = [
  {
    label: 'Thông báo',
    href: '/thong-bao',
    icon: (
      <span className="relative">
        <MessageSquare strokeWidth={1.5} className="size-4.5" />
        <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-ember" />
      </span>
    ),
  },
  {
    label: 'Cá nhân',
    href: '/dashboard/settings',
    icon: <UserRound strokeWidth={1.5} className="size-4.5" />,
  },
];

function NavItem({ item, isActive }: { item: MobileNavItem; isActive: boolean }) {
  return (
    <Link
      to={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.75 no-underline transition-colors',
        FOCUS_RING_CLASS,
      )}
      style={{ height: BAR_H }}
    >
      {/* key remounts the span each time this tab becomes active → replays spring */}
      <span
        key={isActive ? 'active' : 'idle'}
        className={cn(
          'flex items-center justify-center overflow-visible',
          isActive ? 'nav-icon-spring text-ink' : 'text-ink-soft',
        )}
        style={{ width: 18, height: 18 }}
      >
        {item.icon}
      </span>
      <span
        className={cn(
          'text-2xs tracking-wide',
          isActive ? 'font-semibold text-ink' : 'font-medium text-ink-soft',
        )}
      >
        {item.label}
      </span>
      <span
        className={cn(
          'size-1 rounded-full transition-colors',
          isActive ? 'bg-gold' : 'bg-transparent',
        )}
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
          className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-sm"
          viewBox={`0 0 ${SVG_W} ${BAR_H}`}
          preserveAspectRatio="none"
        >
          <path d={NOTCH_FILL} className="fill-day" />
          <path d={NOTCH_STROKE} fill="none" className="stroke-ink/10" strokeWidth="1.5" />
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

      <div className="h-[env(safe-area-inset-bottom)] bg-day" />

      <Link
        to="/la-so"
        aria-label="Lập lá số"
        className={cn(
          'absolute left-1/2 flex -translate-x-1/2 flex-col items-center no-underline',
          FOCUS_RING_CLASS,
        )}
        style={{ top: CIRCLE_TOP }}
      >
        <span
          className="flex items-center justify-center rounded-full bg-night shadow-lg ring-3 ring-day"
          style={{ width: CIRCLE_R * 2, height: CIRCLE_R * 2 }}
        >
          <LogoMark className="size-12" />
        </span>
        {/* Label gets a cream bg so it stays readable even over the transparent notch */}
        <span
          className={cn(
            'mt-1 rounded-sm bg-day px-1 text-2xs tracking-wide',
            isActive('/la-so') ? 'font-bold text-ink' : 'font-semibold text-ink-soft',
          )}
        >
          Lập lá số
        </span>
      </Link>
    </nav>
  );
}
