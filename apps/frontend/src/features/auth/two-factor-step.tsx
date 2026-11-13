import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextLink } from '@/components/ui/text-link';
import { ApiError, errorMessage } from '@/lib/api-error';
import { notify } from '@/lib/toast';
import { authService } from '@/services/auth-service';
import { EMAIL_SEND_FAILED_MESSAGE } from './auth-copy';
import { startSession } from './session';
import { useAuthModal } from './use-auth-modal';

const CHALLENGE_GONE = 410;
const RECOVERY_EMAIL_SENT_MESSAGE =
  'Đã gửi email. Bạn mở liên kết trong thư để tắt xác thực 2 bước.';

interface TwoFactorStepProps {
  challengeToken: string;
  onExpired: () => void;
}

export function TwoFactorStep({ challengeToken, onExpired }: TwoFactorStepProps) {
  const { finish } = useAuthModal();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.verifyTwoFactor(challengeToken, code.trim());
      if (!('user' in result)) {
        throw new Error('Unexpected response');
      }
      startSession(result.user);
      notify.success('Đăng nhập thành công.');
      await finish();
    } catch (caught) {
      setError(errorMessage(caught, 'Chưa xác thực được mã. Bạn thử lại nhé.'));
      if (caught instanceof ApiError && caught.statusCode === CHALLENGE_GONE) {
        onExpired();
      }
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestRecovery = async () => {
    setIsRecovering(true);
    setError(null);

    try {
      await authService.requestTwoFactorRecovery(challengeToken);
      setRecoverySent(true);
      notify.info(RECOVERY_EMAIL_SENT_MESSAGE);
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === CHALLENGE_GONE) {
        onExpired();
        return;
      }
      setError(errorMessage(caught, EMAIL_SEND_FAILED_MESSAGE));
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Form className="grid gap-4" onSubmit={() => void submit()}>
      <p className="text-sm text-muted-foreground">
        Nhập mã 6 chữ số trong ứng dụng xác thực, hoặc một mã phục hồi của bạn.
      </p>

      <FormError message={error} />

      <div className="grid gap-2">
        <Label htmlFor="two-factor-code">Mã xác thực</Label>
        <Input
          autoComplete="one-time-code"
          autoFocus
          id="two-factor-code"
          inputMode="numeric"
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          value={code}
        />
      </div>

      <Button disabled={isSubmitting || code.trim().length < 6} type="submit">
        {isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
      </Button>

      <div className="grid gap-2 text-center text-sm text-muted-foreground">
        <TextLink disabled={isRecovering || recoverySent} onClick={requestRecovery} tone="muted">
          {recoverySent ? 'Đã gửi liên kết vào email của bạn' : 'Mất thiết bị và mã phục hồi?'}
        </TextLink>
        <TextLink onClick={onExpired} tone="muted">
          Quay lại đăng nhập
        </TextLink>
      </div>
    </Form>
  );
}
