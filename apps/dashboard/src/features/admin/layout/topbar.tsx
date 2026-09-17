import { Moon, Sun } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, Button, Dropdown, type MenuProps } from 'antd';
import { useAuthStore, selectUser } from '@/stores/auth-store';
import { dayCanChi } from '@/lib/can-chi';
import { initials } from '@/lib/utils';
import { useTheme } from './use-theme';

export function Topbar() {
  const user = useAuthStore(selectUser);
  const canChi = dayCanChi(new Date());
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const items: MenuProps['items'] = [
    {
      key: 'header',
      type: 'group',
      label: (
        <div className="py-1">
          <p className="text-sm font-medium text-foreground">
            {user?.displayName ?? 'Quản trị viên'}
          </p>
          <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'profile', label: 'Hồ sơ', onClick: () => navigate({ to: '/profile' }) },
    { key: 'settings', label: 'Cài đặt', onClick: () => navigate({ to: '/profile' }) },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', danger: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/30 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm">
        <Moon className="size-4 text-primary" />
        <span className="text-muted-foreground">Hôm nay</span>
        <span className="font-seal text-base leading-none text-primary">Ngày {canChi}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="text"
          shape="circle"
          aria-label={theme === 'dark' ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'}
          onClick={toggle}
          icon={
            theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />
          }
        />

        <div className="mx-1 h-6 w-px bg-border" />

        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <button className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-accent/60">
            <Avatar className="glow-ring" size={32} style={{ background: 'var(--primary)' }}>
              {initials(user?.displayName)}
            </Avatar>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium">{user?.displayName ?? 'Quản trị'}</span>
              <span className="block text-[11px] tracking-wide text-muted-foreground">
                {user?.role ?? '—'}
              </span>
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
