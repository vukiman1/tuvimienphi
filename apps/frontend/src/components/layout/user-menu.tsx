import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, LogOut, Settings, UserRound, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FOCUS_RING_CLASS } from '@/design-system';
import { endSession } from '@/features/auth/session';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth-service';
import { userQueries } from '@/services/user-service';
import { selectUser, useAuthStore } from '@/stores/auth-store';

function BalanceRow() {
  const { data: credit, isError } = useQuery(userQueries.credit());

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
      <Wallet className="size-4" />
      {isError ? 'Balance unavailable' : credit ? `Balance: ${credit.balance}` : 'Loading...'}
    </div>
  );
}

export function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  // Radix returns focus to the trigger on close, which keyboard users need but leaves a focus ring
  // sitting on the trigger after a click outside. Track how the menu was dismissed.
  const dismissedByPointer = useRef(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // The server call only revokes the session server-side. If it fails there is nothing the
      // user can do about it here, and leaving them apparently signed in would be worse.
      console.warn('Logout request failed; clearing the local session anyway', error);
    } finally {
      endSession();
      notify.success('Bạn đã đăng xuất.');
      await navigate({ to: '/' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex items-center gap-2 rounded-xl p-1 text-sm transition-colors hover:bg-current/5 md:gap-3',
          FOCUS_RING_CLASS,
        )}
      >
        <Avatar user={user} />
        <span className="hidden max-w-40 truncate font-medium tracking-wide text-current md:inline">
          {user.displayName ?? user.email}
        </span>
        <ChevronDown className="size-4 text-current transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => {
          if (dismissedByPointer.current) {
            event.preventDefault();
            dismissedByPointer.current = false;
          }
        }}
        onPointerDownOutside={() => {
          dismissedByPointer.current = true;
        }}
      >
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <span className="flex min-w-0 flex-col">
            {user.displayName ? (
              <span className="truncate text-sm font-medium text-foreground">
                {user.displayName}
              </span>
            ) : null}
            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
          </span>
        </DropdownMenuLabel>
        <BalanceRow />
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: '/dashboard/settings' })}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({ user }: { user: { email: string; avatar?: string | null } }) {
  return (
    <span className="flex size-7 items-center justify-center overflow-hidden rounded-lg border-2 border-current bg-current/5 text-current md:size-8">
      {user.avatar ? (
        <img alt={user.email} className="size-full object-cover" src={user.avatar} />
      ) : (
        <UserRound aria-hidden className="size-4" />
      )}
    </span>
  );
}
