import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/services/auth-service';
import { MEDIA } from '@/config/media';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from './profile-avatar';

export function ProfileCard() {
  const meQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: () => authService.getMe() });
  const user = meQuery.data?.user;

  if (meQuery.isLoading) {
    return (
      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 text-sm text-muted-foreground">Đang tải...</CardContent>
      </Card>
    );
  }

  if (meQuery.isError || !user) {
    return (
      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 text-sm font-medium text-destructive">
          Không thể tải thông tin hồ sơ.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border-none bg-white shadow-sm">
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-30 pointer-events-none">
        <img
          src={MEDIA.vanHan.decorCloud}
          alt="Decor"
          className="h-full w-full object-cover object-right"
        />
      </div>

      <CardContent className="relative flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center z-10">
        <div className="flex items-center gap-6">
          <ProfileAvatar user={user} />

          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-[#1a1412]">
              {user.displayName || user.email}
            </h2>
            {user.displayName ? (
              <p className="mt-0.5 text-sm font-medium text-[#6b5a4e]">{user.email}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {!user.hasPassword && (
                <span className="inline-flex items-center rounded-full bg-[#f4ebe1] px-2.5 py-0.5 text-[#904423]">
                  Chưa đặt mật khẩu
                </span>
              )}
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5',
                  user.isEmailVerified
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600',
                )}
              >
                <span
                  className={cn(
                    'mr-1.5 size-1.5 rounded-full',
                    user.isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                />
                {user.isEmailVerified ? 'Email đã xác thực' : 'Email chưa xác thực'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
