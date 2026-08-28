import { Moon, Sun } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore, selectUser } from '@/stores/auth-store';
import { dayCanChi } from '@/lib/can-chi';
import { initials } from '@/lib/utils';
import { useTheme } from './use-theme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
  const user = useAuthStore(selectUser);
  const canChi = dayCanChi(new Date());
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/30 px-6 backdrop-blur-xl">
      {/* Can-chi ngày — the sexagenary day pillar, a familiar sight to anyone reading tử vi. */}
      <div className="flex items-center gap-2 text-sm">
        <Moon className="size-4 text-primary" />
        <span className="text-muted-foreground">Hôm nay</span>
        <span className="font-seal text-base leading-none text-primary">Ngày {canChi}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label={theme === 'dark' ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'}
          onClick={toggle}
        >
          {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-accent/60">
              <Avatar className="glow-ring size-8">
                <AvatarFallback>{initials(user?.displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-medium">{user?.displayName ?? 'Quản trị'}</span>
                <span className="block text-[11px] tracking-wide text-muted-foreground">
                  {user?.role ?? '—'}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.displayName ?? 'Quản trị viên'}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
