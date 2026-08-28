import { Link } from '@tanstack/react-router';
import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';
import { BrandMark } from './brand-mark';

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/92 text-sidebar-foreground backdrop-blur-xl',
        className,
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="glow-ring grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <BrandMark className="size-7" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-wide text-glow">Tử Vi</p>
          <p className="font-seal text-sm leading-none text-primary/70">紫微斗數</p>
        </div>
      </div>

      <div className="mx-5 h-px bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === '/' }}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-foreground data-[status=active]:shadow-[0_0_20px_-8px_var(--primary)]"
          >
            {/* Active marker — a small star flush to the rail. */}
            <span className="absolute top-1/2 -left-3 size-1.5 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow-[0_0_8px_var(--primary)] transition-opacity group-data-[status=active]:opacity-100" />
            <item.icon className="size-[18px] shrink-0 opacity-70 transition-colors group-data-[status=active]:text-primary group-data-[status=active]:opacity-100" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mx-5 h-px bg-sidebar-border" />

      <div className="p-4">
        <div className="rounded-2xl border border-sidebar-border bg-white/[0.04] p-4">
          <p className="flex items-center gap-2 font-display text-sm font-semibold">
            <Moon className="size-4 text-primary" />
            Vượng khí Bính Ngọ
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
            Năm 2026 · Hành Hỏa. Sao tốt chiếu mệnh, vạn sự cát tường như ý.
          </p>
        </div>
      </div>
    </aside>
  );
}
