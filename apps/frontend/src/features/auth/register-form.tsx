import { useState } from 'react';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { EMAIL_PLACEHOLDER } from './auth-copy';
import { registerFieldSchemas, registerSchema, type RegisterFormValues } from './schemas';
import { VerificationCodeForm } from './verification-code-form';

const EMPTY_FORM: RegisterFormValues = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

interface RegisterFormProps {
  onVerified: () => void;
}

export function RegisterForm({ onVerified }: RegisterFormProps) {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const { form, submitError } = useFormWithSubmitError<RegisterFormValues>({
    defaultValues: EMPTY_FORM,
    schema: registerSchema,
    fallbackError: 'Chưa tạo được tài khoản. Bạn thử lại nhé.',
    onSubmit: async (values) => {
      const { email } = await authService.register(values);
      setRegisteredEmail(email);
    },
  });

  if (registeredEmail) {
    return (
      <VerificationCodeForm
        onResend={async () => {
          await authService.resendVerification(registeredEmail);
        }}
        onSubmit={async (code) => {
          await authService.verifyEmail(registeredEmail, code);
          notify.success('Đã xác nhận email. Bạn có thể đăng nhập ngay.');
          onVerified();
        }}
        sentTo={registeredEmail}
        submitLabel="Xác nhận email"
      />
    );
  }

  return (
    <Form className="grid gap-4" onSubmit={form.handleSubmit}>
      <FormError message={submitError} />

      <form.Field
        name="displayName"
        validators={{
          onBlur: registerFieldSchemas.displayName,
          onSubmit: registerFieldSchemas.displayName,
        }}
        children={(field) => (
          <FormField
            autoComplete="name"
            field={field}
            label="Tên của bạn"
            placeholder="Nguyễn Văn A"
          />
        )}
      />

      <form.Field
        name="email"
        validators={{
          onBlur: registerFieldSchemas.email,
          onSubmit: registerFieldSchemas.email,
        }}
        children={(field) => (
          <FormField
            autoComplete="email"
            field={field}
            label="Email"
            placeholder={EMAIL_PLACEHOLDER}
            type="email"
          />
        )}
      />

      <form.Field
        name="password"
        validators={{
          onBlur: registerFieldSchemas.password,
          onSubmit: registerFieldSchemas.password,
        }}
        children={(field) => (
          <FormField
            autoComplete="new-password"
            control={PasswordInput}
            field={field}
            label="Mật khẩu"
          />
        )}
      />

      <form.Field
        name="confirmPassword"
        validators={{
          onBlur: registerFieldSchemas.confirmPassword,
          onSubmit: registerFieldSchemas.confirmPassword,
        }}
        children={(field) => (
          <FormField
            autoComplete="new-password"
            control={PasswordInput}
            field={field}
            label="Nhập lại mật khẩu"
          />
        )}
      />

      <SubmitButton form={form} label="Tạo tài khoản" pendingLabel="Đang tạo tài khoản..." />
    </Form>
  );
}
