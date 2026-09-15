import { useState } from 'react';
import { AuthMethodPanel } from './auth-method-panel';
import { ForgotPasswordForm } from './forgot-password-form';
import { LoginForm } from './login-form';
import { useAuthModal } from './use-auth-modal';

export function SignInPanel() {
  const { open } = useAuthModal();
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  const emailStep = isRecoveringPassword
    ? {
        title: 'Đặt lại mật khẩu',
        description: 'Chúng tôi sẽ gửi email để bạn đặt mật khẩu mới.',
        action: 'Tiếp tục với Email',
      }
    : {
        title: 'Đăng nhập bằng email',
        description: 'Nhập email và mật khẩu của bạn.',
        action: 'Tiếp tục với Email',
      };

  return (
    <AuthMethodPanel
      copy={{
        chooser: {
          title: 'Chào mừng trở lại',
          description: 'Đăng nhập để tiếp tục hành trình khám phá Tử Vi',
        },
        email: emailStep,
        footer: {
          question: 'Chưa có tài khoản?',
          action: 'Đăng ký ngay',
          onAction: () => open('register'),
        },
      }}
      onBack={isRecoveringPassword ? () => setIsRecoveringPassword(false) : undefined}
      renderEmailForm={() =>
        isRecoveringPassword ? (
          <ForgotPasswordForm onDone={() => setIsRecoveringPassword(false)} />
        ) : (
          <LoginForm onForgotPassword={() => setIsRecoveringPassword(true)} />
        )
      }
    />
  );
}
