import { useQueryClient } from '@tanstack/react-query';
import { TitledDialog } from '@/components/ui/titled-dialog';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { ChooseNewPassword } from '@/features/auth/choose-new-password';

interface SetPasswordDialogProps {
  readonly email: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SetPasswordDialog({ email, open, onOpenChange }: SetPasswordDialogProps) {
  const queryClient = useQueryClient();

  return (
    <TitledDialog
      onOpenChange={onOpenChange}
      open={open}
      title="Đặt mật khẩu"
      description="Nhập mã vừa gửi tới email của bạn và chọn mật khẩu. Các thiết bị khác sẽ bị đăng xuất."
    >
      <ChooseNewPassword
        email={email}
        submitLabel="Set password"
        onSave={async (values) => {
          await authService.setPassword(values);
          notify.success('Password set. Other devices were signed out.');
        }}
        onDone={() => {
          onOpenChange(false);
          void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        }}
      />
    </TitledDialog>
  );
}
