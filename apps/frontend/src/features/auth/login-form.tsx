import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { PasswordInput } from '@/components/ui/password-input';
import { TextLink } from '@/components/ui/text-link';
import { UNREACHABLE_SERVER_MESSAGE } from '@/lib/http-request';
import { useFormWithSubmitError } from '@/lib/use-form-with-submit-error';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { EMAIL_PLACEHOLDER } from './auth-copy';
import { startSession } from './session';
import { usePendingTwoFactor } from './pending-two-factor-store';
import { loginSchema, type LoginFormValues } from './schemas';
import { useAuthModal } from './use-auth-modal';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const { finish } = useAuthModal();
  const setChallengeToken = usePendingTwoFactor((state) => state.setChallengeToken);

  const { form, submitError } = useFormWithSubmitError<LoginFormValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
    schema: loginSchema,
    fallbackError: UNREACHABLE_SERVER_MESSAGE,
    onSubmit: async (values) => {
      const result = await authService.login(values);
      if ('twoFactorRequired' in result) {
        setChallengeToken(result.challengeToken);
        return;
      }
      startSession(result.user);
      notify.success('Đăng nhập thành công.');
      await finish();
    },
  });

  return (
    <Form className="grid gap-5" onSubmit={form.handleSubmit}>
      <div className="grid gap-5">
        <FormError message={submitError} />

        <form.Field
          name="email"
          validators={{
            onBlur: loginSchema.shape.email,
            onSubmit: loginSchema.shape.email,
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
            onBlur: loginSchema.shape.password,
            onSubmit: loginSchema.shape.password,
          }}
          children={(field) => (
            <FormField
              autoComplete="current-password"
              control={PasswordInput}
              field={field}
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
            />
          )}
        />

        <div className="flex items-center justify-between gap-3">
          <form.Field
            name="rememberMe"
            children={(field) => (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={field.state.value}
                  name={field.name}
                  onChange={(event) => field.handleChange(event.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
            )}
          />

          <TextLink className="text-sm" onClick={onForgotPassword}>
            Quên mật khẩu?
          </TextLink>
        </div>
      </div>

      <div className="grid gap-4">
        <SubmitButton form={form} label="Đăng nhập" pendingLabel="Đang đăng nhập..." />
      </div>
    </Form>
  );
}
