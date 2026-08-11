import { Link } from '@tanstack/react-router';
import { NAV_ITEMS } from '@/components/layout/nav-items';
import { appConfig } from '@/config/app-config';

const FOOTER_GRADIENT = 'linear-gradient(110deg, #17171a 0%, #2b2925 55%, #131315 100%)';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#c9a15c]/25" style={{ background: FOOTER_GRADIENT }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <Link
            className="flex shrink-0 items-center no-underline"
            to="/"
            aria-label={appConfig.app.name}
          >
            <img src="/logo.png" alt="" className="h-8 w-auto" />
          </Link>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
            aria-label="Footer"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium tracking-wide text-[#a6a6ab] no-underline transition-colors hover:text-[#e5c886]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-1 border-t border-[#c9a15c]/15 pt-4 text-center md:flex-row md:justify-between">
          <p className="text-xs text-[#8b8b90]">
            © {new Date().getFullYear()} {appConfig.app.name}
          </p>
          <p className="text-xs text-[#8b8b90]">Nội dung chỉ mang tính chất tham khảo.</p>
        </div>
      </div>
    </footer>
  );
}
