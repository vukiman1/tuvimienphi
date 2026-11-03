import { useState, type FormEvent } from 'react';
import { Alert, Button, Flex, Input, Typography } from 'antd';
import { ApiError, errorMessage } from '@/lib/api-error';

const HTTP_GONE = 410;
const CODE_LENGTH = 6;
const CODE_INPUT_ID = 'two-factor-code';
const WRONG_CODE = 'Mã không đúng, bạn thử lại.';
const EXPIRED = 'Phiên đăng nhập đã hết hạn, bạn đăng nhập lại bằng Google.';

interface TwoFactorCodeFormProps {
  readonly onSubmit: (code: string) => Promise<void>;
  readonly onExpired: (message: string) => void;
}

export function TwoFactorCodeForm({ onSubmit, onExpired }: TwoFactorCodeFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(code.trim());
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === HTTP_GONE) {
        onExpired(errorMessage(caught, EXPIRED));
        return;
      }
      setError(errorMessage(caught, WRONG_CODE));
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} style={{ width: '100%' }}>
      <Flex vertical gap={12}>
        <label htmlFor={CODE_INPUT_ID}>
          <Typography.Text strong>Mã xác thực</Typography.Text>
        </label>
        <Typography.Text type="secondary">
          Nhập mã {CODE_LENGTH} số trong ứng dụng xác thực của bạn.
        </Typography.Text>
        <Input
          autoComplete="one-time-code"
          autoFocus
          id={CODE_INPUT_ID}
          inputMode="numeric"
          onChange={(event) => setCode(event.target.value)}
          size="large"
          value={code}
        />
        {error ? <Alert type="error" showIcon title={error} /> : null}
        <Button
          block
          disabled={code.trim().length === 0}
          htmlType="submit"
          loading={isSubmitting}
          size="large"
          type="primary"
        >
          Xác nhận
        </Button>
      </Flex>
    </form>
  );
}
