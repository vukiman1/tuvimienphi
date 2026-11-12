import { type ReactElement, useCallback, useRef } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { NAV_ITEMS, type NavItem } from '@/components/layout/nav-items';
import { NavigationProgress } from '@/components/layout/navigation-progress';
import { UserMenu } from '@/components/layout/user-menu';
import {
  CHAPTER_TONE_CLASS,
  type ChapterAnchor,
  ChapterTone,
  FOCUS_RING_CLASS,
  Logo,
  LogoTone,
  isDarkTone,
  useChapterAt,
} from '@/design-system';
import { useAuthModal } from '@/features/auth/use-auth-modal';
import { cn } from '@/lib/utils';
import { selectIsInitializing, selectUser, useAuthStore } from '@/stores/auth-store';

const NAV_LINK_CLASS =
  'relative shrink-0 pb-1 text-xs tracking-wide whitespace-nowrap no-underline transition-colors md:text-sm after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none';

function mutedTextClass(tone: ChapterTone | null): string {
  if (tone === null) {
    return 'text-ink-soft hover:text-ink';
  }
  if (isDarkTone(tone)) {
    return 'text-day-soft hover:text-day';
  }
  return tone === ChapterTone.Ember ? 'text-ink' : 'text-ink-soft hover:text-ink';
}

interface NavLinkProps {
  readonly item: NavItem;
  readonly isActive: boolean;
  readonly isOverDark: boolean;
  readonly mutedClass: string;
}

function NavLink({ item, isActive, isOverDark, mutedClass }: NavLinkProps) {
  return (
    <Link
      to={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        NAV_LINK_CLASS,
        FOCUS_RING_CLASS,
        isOverDark ? 'after:bg-gold' : 'after:bg-ink',
        isActive && 'font-semibold after:scale-x-100',
        !isActive && 'font-medium',
        !isActive && mutedClass,
      )}
    >
      {item.label}
    </Link>
  );
}

interface SiteHeaderProps {
  readonly isStoryPage?: boolean;
}

export function SiteHeader({ isStoryPage = false }: SiteHeaderProps): ReactElement {
  const { open: openAuth } = useAuthModal();
  const user = useAuthStore(selectUser);
  const isInitializing = useAuthStore(selectIsInitializing);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const headerRef = useRef<HTMLElement>(null);
  const probeUnderHeader = useCallback<ChapterAnchor>(
    () => headerRef.current?.getBoundingClientRect().bottom ?? 0,
    [],
  );
  const chapterUnderHeader = useChapterAt(probeUnderHeader);
  const storyTone = chapterUnderHeader?.tone ?? ChapterTone.Day;
  const tone = isStoryPage ? storyTone : null;
  const isOverDark = tone !== null && isDarkTone(tone);
  const mutedClass = mutedTextClass(tone);

  const isItemActive = (item: NavItem): boolean => pathname.startsWith(item.href);

  return (
    <header
      ref={headerRef}
      className={
        isStoryPage
          ? cn(
              'fixed inset-x-0 top-0 z-30 transition-colors duration-500 motion-reduce:transition-none',
              CHAPTER_TONE_CLASS[storyTone],
            )
          : 'relative border-b border-ink/10 bg-day text-ink'
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 md:gap-x-9 md:px-6">
        <Link className={cn('flex shrink-0 items-center no-underline', FOCUS_RING_CLASS)} to="/">
          <Logo
            tone={isOverDark ? LogoTone.OnDark : LogoTone.OnLight}
            className="text-xl md:text-2xl"
          />
        </Link>

        <nav
          className="order-last flex w-full items-center justify-between gap-4 overflow-x-auto border-t border-current/15 px-1 pt-2 pb-1 md:order-none md:ml-auto md:w-auto md:justify-start md:gap-9 md:overflow-visible md:border-t-0 md:p-0"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isItemActive(item)}
              isOverDark={isOverDark}
              mutedClass={mutedClass}
            />
          ))}
        </nav>

        <div className="inline-flex min-h-9 shrink-0 items-center gap-3" aria-busy={isInitializing}>
          {isInitializing ? (
            <span className={cn('text-sm', mutedClass)} role="status">
              Loading session...
            </span>
          ) : user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => openAuth('login')}
              type="button"
              className={cn(
                'rounded-full border border-current px-4 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-current/10 md:px-5 md:py-1.5 md:text-xs md:tracking-[0.18em]',
                FOCUS_RING_CLASS,
              )}
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
