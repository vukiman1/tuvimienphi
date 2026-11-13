import type { ReactElement } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { Bookmark, CalendarCheck, ChartSpline, House, type LucideIcon } from 'lucide-react';
import { FOCUS_RING_CLASS, LaSoBoardIcon, focusHashTarget } from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { cn } from '@/lib/utils';

const TAB_ICON_STROKE_WIDTH = 1.75;
const BIRTH_FORM_ACTIVE_OPTIONS = { exact: true, includeHash: true } as const;

interface MobileTab {
  readonly label: string;
  readonly href: LinkProps['to'];
  readonly Icon: LucideIcon;
  readonly isExactMatch?: boolean;
}

const LEADING_TABS: readonly MobileTab[] = [
  { label: 'Trang chủ', href: '/', Icon: House, isExactMatch: true },
  { label: 'Vận hạn', href: '/van-han', Icon: ChartSpline },
];

const TRAILING_TABS: readonly MobileTab[] = [
  { label: 'Ngày tốt', href: '/ngay-tot', Icon: CalendarCheck },
  { label: 'Lá số của tôi', href: '/la-so', Icon: Bookmark },
];

const LABEL_CLASS = 'text-2xs leading-none whitespace-nowrap';

interface TabLinkProps {
  readonly tab: MobileTab;
}

function TabLink({ tab }: TabLinkProps): ReactElement {
  const { Icon } = tab;
  return (
    <Link
      to={tab.href}
      activeOptions={{ exact: tab.isExactMatch === true }}
      className={cn(
        'relative flex min-h-11 flex-col items-center gap-1 pt-2.5 no-underline',
        FOCUS_RING_CLASS,
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && <span aria-hidden className="absolute top-0 h-0.75 w-7 rounded-b bg-gold" />}
          <Icon
            aria-hidden
            strokeWidth={TAB_ICON_STROKE_WIDTH}
            className={cn('size-5.5', isActive ? 'text-ink' : 'text-ink-soft')}
          />
          <span
            className={cn(
              LABEL_CLASS,
              isActive ? 'font-semibold text-ink' : 'font-medium text-ink-soft',
            )}
          >
            {tab.label}
          </span>
        </>
      )}
    </Link>
  );
}

function BirthFormAction(): ReactElement {
  return (
    <Link
      to="/"
      hash={BIRTH_FORM_ANCHOR}
      activeOptions={BIRTH_FORM_ACTIVE_OPTIONS}
      onClick={() => focusHashTarget(BIRTH_FORM_ANCHOR)}
      className={cn('flex flex-col items-center gap-1 text-ink no-underline', FOCUS_RING_CLASS)}
    >
      <span className="-mt-6.5 flex size-13 items-center justify-center rounded-full bg-gold text-ink shadow-lg ring-4 ring-day">
        <LaSoBoardIcon className="size-6" />
      </span>
      <span className={cn(LABEL_CLASS, 'font-semibold')}>Lập lá số</span>
    </Link>
  );
}

export function MobileNavBar(): ReactElement {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 bg-day/97 pb-[env(safe-area-inset-bottom)] shadow-bottom-bar md:hidden"
    >
      <div className="grid h-17 grid-cols-5 items-end border-t border-ink/10 px-1 pb-2">
        {LEADING_TABS.map((tab) => (
          <TabLink key={tab.label} tab={tab} />
        ))}
        <BirthFormAction />
        {TRAILING_TABS.map((tab) => (
          <TabLink key={tab.label} tab={tab} />
        ))}
      </div>
    </nav>
  );
}
