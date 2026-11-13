import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { errorMessage } from '@/lib/api-error';
import { notify } from '@/lib/toast';
import { CODE_RESEND_FAILED_MESSAGE, CODE_RESENT_MESSAGE, EMAIL_CODE_LABEL } from './auth-copy';
import { ResendCodeLink } from './resend-code-link';
import { useResendCooldown } from './use-resend-cooldown';

const CODE_LENGTH = 6;

interface VerificationCodeFormProps {
  sentTo: string;
  submitLabel: string;
  onSubmit: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
}

export function VerificationCodeForm({
  sentTo,
  submitLabel,
  onSubmit,
  onResend,
}: VerificationCodeFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const cooldown = useResendCooldown();

  const submit = async (value: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(value);
    } catch (caught) {
      setError(errorMessage(caught, 'Chưa kiểm tra được mã. Bạn thử lại nhé.'));
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (!onResend) {
      return;
    }
    setIsResending(true);
    setError(null);

    try {
      await onResend();
      notify.info(CODE_RESENT_MESSAGE);
      cooldown.restart();
      setCode('');
    } catch {
      setError(CODE_RESEND_FAILED_MESSAGE);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form className="grid gap-4" onSubmit={() => void submit(code)}>
      <p className="text-center text-sm text-muted-foreground">
        Nhập mã {CODE_LENGTH} chữ số đã gửi tới{' '}
        <span className="font-medium text-foreground">{sentTo}</span>.
      </p>

      <FormError message={error} />

      <div className="flex justify-center">
        <InputOTP
          autoFocus
          aria-label={EMAIL_CODE_LABEL}
          disabled={isSubmitting}
          maxLength={CODE_LENGTH}
          onChange={(value) => {
            setCode(value);
            // Submitting on the last digit saves a click; people rarely stop to check the boxes.
            if (value.length === CODE_LENGTH) {
              void submit(value);
            }
          }}
          value={code}
        >
          <InputOTPGroup>
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <InputOTPSlot index={index} key={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button disabled={isSubmitting || code.length < CODE_LENGTH} type="submit">
        {isSubmitting ? 'Đang kiểm tra...' : submitLabel}
      </Button>

      {onResend && (
        <ResendCodeLink
          cooldown={cooldown}
          isSending={isResending}
          onResend={() => void resend()}
        />
      )}
    </Form>
  );
}
