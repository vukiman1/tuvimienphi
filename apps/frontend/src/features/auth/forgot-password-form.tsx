import { useState } from 'react';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { EMAIL_PLACEHOLDER, EMAIL_SEND_FAILED_MESSAGE } from './auth-copy';
import { ChooseNewPassword } from './choose-new-password';
import { emailAddress } from './schemas';

interface ForgotPasswordFormProps {
  onDone: () => void;
}

export function ForgotPasswordForm({ onDone }: ForgotPasswordFormProps) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { form, submitError } = useFormWithSubmitError({
    defaultValues: { email: '' },
    schema: z.object({ email: emailAddress }),
    fallbackError: EMAIL_SEND_FAILED_MESSAGE,
    onSubmit: async ({ email }) => {
      await authService.forgotPassword(email);
      setSentTo(email);
    },
  });

  if (sentTo) {
    return (
      <ChooseNewPassword
        email={sentTo}
        submitLabel="Đặt lại mật khẩu"
        onSave={async (values) => {
          await authService.resetPassword({ email: sentTo, ...values });
          notify.success('Đã đổi mật khẩu. Mọi thiết bị đã được đăng xuất.');
        }}
        onDone={onDone}
      />
    );
  }

  return (
    <Form className="grid gap-4" onSubmit={form.handleSubmit}>
      <FormError message={submitError} />

      <form.Field
        name="email"
        validators={{ onBlur: emailAddress, onSubmit: emailAddress }}
        children={(field) => (
          <FormField
            autoComplete="email"
            autoFocus
            field={field}
            label="Email"
            placeholder={EMAIL_PLACEHOLDER}
            type="email"
          />
        )}
      />

      <SubmitButton form={form} label="Gửi mã" pendingLabel="Đang gửi..." />
    </Form>
  );
}
