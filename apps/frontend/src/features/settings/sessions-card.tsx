import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Monitor, RefreshCw, Smartphone, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import type { UserLoginSession } from '@org/shared-contracts';
import { cn } from '@/lib/utils';

export function SessionsCard() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const sessionsQuery = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authService.getSessions(),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: async () => {
      notify.success('Đã đăng xuất thiết bị.');
      await invalidate();
    },
    onError: () => notify.error('Không thể đăng xuất thiết bị này.'),
  });
  const revokeOthersMutation = useMutation({
    mutationFn: () => authService.revokeOtherSessions(),
    onSuccess: async () => {
      notify.success('Đã đăng xuất khỏi tất cả thiết bị khác.');
      await invalidate();
    },
    onError: () => notify.error('Không thể đăng xuất các thiết bị khác.'),
  });

  const askThenRevokeOthers = async () => {
    const confirmed = await confirm({
      title: 'Đăng xuất thiết bị khác?',
      description:
        'Mọi thiết bị khác ngoại trừ thiết bị này sẽ bị đăng xuất. Hành động này không thể hoàn tác.',
      confirmLabel: 'Đồng ý',
      destructive: true,
    });
    if (confirmed) {
      revokeOthersMutation.mutate();
    }
  };

  const sessions = sessionsQuery.data?.sessions ?? [];
  const hasOtherSessions = sessions.some((session) => !session.isCurrent);

  return (
    <Card className="rounded-2xl border-none bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f4ebe1]">
              <Monitor className="size-5 text-[#904423]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-[#1a1412]">Phiên đăng nhập</h3>
              <p className="mt-1 text-sm text-[#6b5a4e]">
                Các thiết bị đang truy cập tài khoản của bạn.
              </p>
            </div>
          </div>
          <Button
            aria-label="Refresh sessions"
            disabled={sessionsQuery.isFetching}
            onClick={() => sessionsQuery.refetch()}
            variant="outline"
            className="shrink-0 gap-2 border-[#e4d5c7] text-[#6b5a4e] hover:bg-[#f4ebe1]/50 hover:text-[#1a1412]"
          >
            <RefreshCw className={cn('size-4', sessionsQuery.isFetching && 'animate-spin')} />
            Làm mới
          </Button>
        </div>

        <div className="mt-6">
          {sessionsQuery.isLoading ? (
            <p className="text-sm text-[#6b5a4e]">Đang tải...</p>
          ) : sessionsQuery.isError ? (
            <p className="text-sm font-medium text-destructive">Không thể tải phiên đăng nhập.</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[#6b5a4e]">Không tìm thấy phiên hoạt động nào.</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr className="bg-[#fcfaf8] text-[11px] font-bold tracking-wider text-[#904423]/70 uppercase">
                      <th className="rounded-l-lg p-3 font-label">Thiết bị</th>
                      <th className="p-3 font-label">Địa chỉ IP</th>
                      <th className="p-3 font-label">Lần truy cập gần nhất</th>
                      <th className="p-3 font-label">Hết hạn</th>
                      <th className="rounded-r-lg p-3 font-label">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        isRevoking={
                          revokeMutation.isPending && revokeMutation.variables === session.id
                        }
                        onRevoke={() => revokeMutation.mutate(session.id)}
                        session={session}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y md:hidden">
                {sessions.map((session) => (
                  <SessionListItem
                    key={session.id}
                    isRevoking={revokeMutation.isPending && revokeMutation.variables === session.id}
                    onRevoke={() => revokeMutation.mutate(session.id)}
                    session={session}
                  />
                ))}
              </ul>

              {hasOtherSessions && (
                <div className="mt-6 border-t border-[#e4d5c7]/40 pt-6">
                  <Button
                    disabled={revokeOthersMutation.isPending}
                    onClick={askThenRevokeOthers}
                    variant="outline"
                    className="gap-2 border-[#e4d5c7] text-[#6b5a4e] hover:bg-[#f4ebe1]/50 hover:text-[#1a1412]"
                  >
                    <Monitor className="size-4" />
                    Đăng xuất khỏi tất cả thiết bị khác
                  </Button>
                  <p className="mt-2 text-xs text-[#6b5a4e]">
                    Bạn sẽ vẫn đăng nhập trên thiết bị hiện tại.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type SessionRowProps = {
  session: UserLoginSession;
  isRevoking: boolean;
  onRevoke: () => void;
};

function SessionRow({ session, isRevoking, onRevoke }: SessionRowProps) {
  const Icon = session.deviceType === 'Mobile' ? Smartphone : Monitor;

  return (
    <tr className="border-b border-[#e4d5c7]/40 last:border-b-0">
      <td className="border-b border-[#e4d5c7]/40 py-4 pr-4 last:border-b-0">
        <div className="flex items-center gap-4">
          <span className="flex size-10 items-center justify-center rounded-lg border border-[#e4d5c7]/60 bg-[#fcfaf8] text-[#6b5a4e]">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#1a1412]">{sessionName(session)}</p>
              {session.isCurrent && (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Hiện tại
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#6b5a4e]">
              {session.userAgent ?? 'Unknown user agent'}
            </p>
          </div>
        </div>
      </td>
      <td className="border-b border-[#e4d5c7]/40 py-4 pr-4">
        <div className="flex items-center gap-2">
          {session.country === 'VN' || session.country === 'Vietnam' ? (
            <span className="flex size-4 items-center justify-center overflow-hidden rounded-[2px] bg-[#da251d]">
              <span className="text-[10px] text-[#ffcd00]">★</span>
            </span>
          ) : (
            <span className="inline-block size-4 rounded-[2px] bg-muted" />
          )}
          <span className="text-sm font-medium text-[#6b5a4e]">
            {session.ipAddress ?? 'Unknown'}
          </span>
        </div>
        <p className="text-xs text-[#904423]/70">{sessionLocation(session)}</p>
      </td>
      <td className="border-b border-[#e4d5c7]/40 py-4 pr-4">
        <p className="text-sm font-medium text-[#6b5a4e]">
          {formatDateDateOnly(session.lastSeenAt)}
        </p>
        <p className="text-xs text-[#904423]/70">{formatDateTimeOnly(session.lastSeenAt)}</p>
      </td>
      <td className="border-b border-[#e4d5c7]/40 py-4 pr-4">
        <p className="text-sm font-medium text-[#6b5a4e]">
          {formatDateDateOnly(session.expiresAt)}
        </p>
        <p className="text-xs text-[#904423]/70">{formatDateTimeOnly(session.expiresAt)}</p>
      </td>
      <td className="border-b border-[#e4d5c7]/40 py-4">
        {!session.isCurrent && (
          <Button
            aria-label="Đăng xuất"
            disabled={isRevoking}
            onClick={onRevoke}
            variant="outline"
            className="h-8 gap-1.5 border-red-200 bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </Button>
        )}
      </td>
    </tr>
  );
}

function SessionListItem({ session, isRevoking, onRevoke }: SessionRowProps) {
  const Icon = session.deviceType === 'Mobile' ? Smartphone : Monitor;

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#e4d5c7]/60 bg-[#fcfaf8] text-[#6b5a4e]">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-[#1a1412]">{sessionName(session)}</p>
              {session.isCurrent && (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Hiện tại
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#6b5a4e]">{session.userAgent ?? 'Unknown'}</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-[#6b5a4e]">
                <span className="font-medium">IP:</span> {session.ipAddress ?? 'Unknown'}
              </p>
              <p className="text-xs text-[#6b5a4e]">
                <span className="font-medium">Vị trí:</span> {sessionLocation(session)}
              </p>
              <p className="text-xs text-[#6b5a4e]">
                <span className="font-medium">Gần nhất:</span> {formatDate(session.lastSeenAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          aria-label="Đăng xuất"
          disabled={isRevoking}
          onClick={onRevoke}
          variant="outline"
          className="w-full gap-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      )}
    </li>
  );
}

function sessionName(session: UserLoginSession): string {
  const parts = [session.browserName, session.osName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' trên ');
  }
  return session.deviceType ?? 'Thiết bị không rõ';
}

function sessionLocation(session: UserLoginSession): string {
  const parts = [session.city, session.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Không rõ';
}

function formatDateDateOnly(value: string | null): string {
  if (!value) return 'Không bao giờ';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ';

  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTimeOnly(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

function formatDate(value: string | null): string {
  if (!value) return 'Không bao giờ';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
