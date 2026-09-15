import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { ChangePasswordDialog } from './change-password-dialog';

export function SecurityCard() {
  const [isChanging, setIsChanging] = useState(false);

  const meQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: () => authService.getMe() });
  const user = meQuery.data?.user;

  const emailMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => notify.success('Kiểm tra email của bạn để lấy liên kết.'),
    onError: () => notify.error('Không thể gửi email. Vui lòng thử lại.'),
  });

  if (!user) {
    return (
      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 text-sm text-muted-foreground">Đang tải...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-none bg-white shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f4ebe1]">
            <Lock className="size-5 text-[#904423]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-[#1a1412]">Mật khẩu</h3>
            <p className="mt-1 text-sm text-[#6b5a4e]">
              {user.hasPassword
                ? 'Đổi mật khẩu sẽ đăng xuất tất cả các thiết bị khác của bạn.'
                : 'Tài khoản này đang đăng nhập bằng Google. Bạn có thể đặt mật khẩu để đăng nhập mà không cần Google.'}
            </p>
          </div>
        </div>

        <div className="flex justify-start sm:pl-16">
          {user.hasPassword ? (
            <Button
              onClick={() => setIsChanging(true)}
              className="gap-2 bg-[#904423] hover:bg-[#7a391e]"
            >
              <KeyRound className="size-4" />
              Đổi mật khẩu
            </Button>
          ) : (
            <Button
              disabled={emailMutation.isPending}
              onClick={() => emailMutation.mutate(user.email)}
              className="gap-2 bg-[#904423] hover:bg-[#7a391e]"
            >
              <KeyRound className="size-4" />
              Đặt mật khẩu
            </Button>
          )}
        </div>
      </CardContent>

      <ChangePasswordDialog onOpenChange={setIsChanging} open={isChanging} />
    </Card>
  );
}
