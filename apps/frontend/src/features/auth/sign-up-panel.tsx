import { AuthMethodPanel } from './auth-method-panel';
import { RegisterForm } from './register-form';
import { useAuthModal } from './use-auth-modal';

export function SignUpPanel() {
  const { open } = useAuthModal();

  return (
    <AuthMethodPanel
      copy={{
        chooser: {
          title: 'Tạo tài khoản',
          description: 'Đăng ký miễn phí để bắt đầu hành trình khám phá Tử Vi',
        },
        email: {
          title: 'Đăng ký bằng email',
          description: 'Miễn phí, chỉ mất một lát.',
          action: 'Tiếp tục với Email',
        },
        footer: {
          question: 'Đã có tài khoản?',
          action: 'Đăng nhập',
          onAction: () => open('login'),
        },
      }}
      renderEmailForm={() => <RegisterForm onVerified={() => open('login')} />}
    />
  );
}
