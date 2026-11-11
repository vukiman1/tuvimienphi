import { Link } from '@tanstack/react-router';
import { NAV_ITEMS } from '@/components/layout/nav-items';
import { appConfig } from '@/config/app-config';
import { FOCUS_RING_CLASS, Logo, LogoTone } from '@/design-system';
import { cn } from '@/lib/utils';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-day text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <Link className={cn('flex shrink-0 items-center no-underline', FOCUS_RING_CLASS)} to="/">
            <Logo tone={LogoTone.OnLight} className="text-xl" />
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
                  'text-sm font-medium tracking-wide text-ink-soft no-underline transition-colors hover:text-ink',
                  FOCUS_RING_CLASS,
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-1 border-t border-ink/10 pt-4 text-center md:flex-row md:justify-between">
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} {appConfig.app.name}
          </p>
          <p className="text-xs text-ink-soft">Nội dung chỉ mang tính chất tham khảo.</p>
        </div>
      </div>
    </footer>
  );
}
