import { useState } from 'react';
import type { SetPasswordPayload } from '@org/shared-contracts';
import { z } from 'zod';
import { FieldError } from '@/components/ui/field-error';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { ResendCodeLink } from './resend-code-link';
import { strongPassword } from './schemas';
import { useResendCooldown } from './use-resend-cooldown';

const CODE_LENGTH = 6;

const fields = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the six-digit code.'),
  password: strongPassword,
  confirmPassword: z.string().min(1, 'Confirm your new password.'),
});

type ResetFormValues = z.infer<typeof fields>;

const schema = fields.refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

interface ChooseNewPasswordProps {
  readonly email: string;
  readonly submitLabel: string;
  readonly onSave: (values: SetPasswordPayload) => Promise<void>;
  readonly onDone: () => void;
}

export function ChooseNewPassword({ email, submitLabel, onSave, onDone }: ChooseNewPasswordProps) {
  const cooldown = useResendCooldown();
  const [isResending, setIsResending] = useState(false);

  const { form, submitError } = useFormWithSubmitError<ResetFormValues>({
    defaultValues: { code: '', password: '', confirmPassword: '' },
    schema,
    fallbackError: 'Could not save your password.',
    onSubmit: async (values) => {
      await onSave(values);
      onDone();
    },
  });

  const resend = async (): Promise<void> => {
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      cooldown.restart();
      notify.info('Another code is on its way.');
    } catch {
      notify.error('Could not send another code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form className="grid gap-4" onSubmit={form.handleSubmit}>
      <p className="text-center text-sm text-muted-foreground">
        Enter the code sent to <span className="font-medium text-foreground">{email}</span> and pick
        a new password.
      </p>

      <FormError message={submitError} />

      <form.Field
        name="code"
        validators={{ onSubmit: fields.shape.code }}
        children={(field) => (
          <div className="grid gap-2">
            <div className="flex justify-center">
              <InputOTP
                aria-label="Verification code"
                autoFocus
                maxLength={CODE_LENGTH}
                onChange={field.handleChange}
                value={field.state.value}
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot index={index} key={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldError errors={field.state.meta.errors} id={`${field.name}-error`} />
          </div>
        )}
      />

      <form.Field
        name="password"
        validators={{ onBlur: fields.shape.password, onSubmit: fields.shape.password }}
        children={(field) => (
          <FormField
            autoComplete="new-password"
            control={PasswordInput}
            field={field}
            label="New password"
          />
        )}
      />

      <form.Field
        name="confirmPassword"
        validators={{ onBlur: fields.shape.confirmPassword }}
        children={(field) => (
          <FormField
            autoComplete="new-password"
            control={PasswordInput}
            field={field}
            label="Confirm new password"
          />
        )}
      />

      <SubmitButton form={form} label={submitLabel} pendingLabel="Saving..." />

      <ResendCodeLink cooldown={cooldown} isSending={isResending} onResend={() => void resend()} />
    </Form>
  );
}
