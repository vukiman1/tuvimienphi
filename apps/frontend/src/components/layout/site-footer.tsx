import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { NAV_ITEMS } from '@/components/layout/nav-items';
import { appConfig } from '@/config/app-config';
import { FOCUS_RING_CLASS, Logo, LogoTone } from '@/design-system';
import { useNow } from '@/hooks/use-now';
import { cn } from '@/lib/utils';

interface FooterSurface {
  readonly footer: string;
  readonly divider: string;
  readonly muted: string;
  readonly linkHover: string;
  readonly logoTone: LogoTone;
}

const DAY_SURFACE: FooterSurface = {
  footer: 'border-t border-ink/10 bg-day text-ink',
  divider: 'border-ink/10',
  muted: 'text-ink-soft',
  linkHover: 'hover:text-ink',
  logoTone: LogoTone.OnLight,
};

const NIGHT_SURFACE: FooterSurface = {
  footer: 'bg-night text-day',
  divider: 'border-day/15',
  muted: 'text-day-soft',
  linkHover: 'hover:text-day',
  logoTone: LogoTone.OnDark,
};

interface SiteFooterProps {
  readonly isStoryPage?: boolean;
}

export function SiteFooter({ isStoryPage = false }: SiteFooterProps): ReactElement {
  const now = useNow();
  const surface = isStoryPage ? NIGHT_SURFACE : DAY_SURFACE;
  return (
    <footer className={surface.footer}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <Link className={cn('flex shrink-0 items-center no-underline', FOCUS_RING_CLASS)} to="/">
            <Logo tone={surface.logoTone} className="text-xl" />
          </Link>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
            aria-label="Footer"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-sm font-medium tracking-wide no-underline transition-colors',
                  surface.muted,
                  surface.linkHover,
                  FOCUS_RING_CLASS,
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className={cn(
            'flex flex-col items-center gap-1 border-t pt-4 text-center md:flex-row md:justify-between',
            surface.divider,
          )}
        >
          <p className={cn('text-xs', surface.muted)}>
            © {now.getFullYear()} {appConfig.app.name}
          </p>
          <p className={cn('text-xs', surface.muted)}>Nội dung chỉ mang tính chất tham khảo.</p>
        </div>
      </div>
    </footer>
  );
}
