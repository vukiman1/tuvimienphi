import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { DisableTwoFactorDialog } from './disable-two-factor-dialog';
import { RecoveryCodesDialog } from './recovery-codes-dialog';
import { TwoFactorSetupDialog } from './two-factor-setup-dialog';

const TWO_FACTOR_QUERY_KEY = ['auth', '2fa'];

export function TwoFactorCard() {
  const queryClient = useQueryClient();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: TWO_FACTOR_QUERY_KEY,
    queryFn: () => authService.getTwoFactorStatus(),
  });

  const meQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: () => authService.getMe() });
  const hasPassword = meQuery.data?.user.hasPassword ?? true;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: TWO_FACTOR_QUERY_KEY });

  const disableMutation = useMutation({
    mutationFn: (password: string) => authService.disableTwoFactor(password),
    onSuccess: async () => {
      setIsDisabling(false);
      setDisableError(null);
      notify.success('Đã tắt xác thực 2 bước.');
      await invalidate();
    },
    onError: () => setDisableError('Mật khẩu không chính xác.'),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => authService.regenerateRecoveryCodes(),
    onSuccess: async ({ recoveryCodes }) => {
      setFreshCodes(recoveryCodes);
      await invalidate();
    },
    onError: () => notify.error('Không thể tạo mã phục hồi mới.'),
  });

  const status = statusQuery.data;

  if (statusQuery.isError) {
    return (
      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 text-sm font-medium text-destructive" role="alert">
          Không thể tải cài đặt xác thực 2 bước.
        </CardContent>
      </Card>
    );
  }

  if (!status) {
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
            <ShieldCheck className="size-5 text-[#904423]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-[#1a1412]">Xác thực 2 bước</h3>
            <p className="mt-1 text-sm text-[#6b5a4e]">
              {status.enabled
                ? 'Cần nhập mã từ ứng dụng xác thực để đăng nhập.'
                : 'Tăng cường bảo mật cho tài khoản bằng ứng dụng xác thực (Google Authenticator, Authy, ...).'}
            </p>
          </div>
        </div>

        <div className="flex justify-start sm:pl-16">
          {status.enabled ? (
            <div className="grid gap-3">
              <p className="text-sm text-[#6b5a4e]">
                Còn {status.unusedRecoveryCodes} mã phục hồi.
                {status.unusedRecoveryCodes <= 2 && ' Hãy tạo bộ mã mới trước khi hết.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={regenerateMutation.isPending}
                  onClick={() => regenerateMutation.mutate()}
                  variant="outline"
                  className="border-[#e4d5c7] text-[#6b5a4e] hover:bg-[#f4ebe1]/50 hover:text-[#1a1412]"
                >
                  Tạo mã phục hồi mới
                </Button>
                <Button
                  disabled={disableMutation.isPending}
                  onClick={() => setIsDisabling(true)}
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Tắt
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {!hasPassword && (
                <p className="text-sm text-[#6b5a4e]">
                  Vui lòng đặt mật khẩu trước - bạn sẽ cần dùng nó để tắt tính năng này.
                </p>
              )}
              <div>
                <Button
                  disabled={!hasPassword}
                  onClick={() => setIsSettingUp(true)}
                  variant="outline"
                  className="gap-2 border-[#e4d5c7] text-[#6b5a4e] hover:bg-[#f4ebe1]/50 hover:text-[#1a1412]"
                >
                  <ShieldCheck className="size-4" />
                  Bật xác thực 2 bước
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <TwoFactorSetupDialog
        onEnabled={async (codes) => {
          setIsSettingUp(false);
          setFreshCodes(codes);
          await invalidate();
        }}
        onOpenChange={setIsSettingUp}
        open={isSettingUp}
      />

      <DisableTwoFactorDialog
        error={disableError}
        isPending={disableMutation.isPending}
        onConfirm={(password) => disableMutation.mutate(password)}
        onOpenChange={(open) => {
          setIsDisabling(open);
          if (!open) {
            setDisableError(null);
          }
        }}
        open={isDisabling}
      />

      <RecoveryCodesDialog codes={freshCodes} onClose={() => setFreshCodes(null)} />
    </Card>
  );
}
