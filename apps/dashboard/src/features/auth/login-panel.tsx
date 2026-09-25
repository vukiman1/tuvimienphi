import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Alert, Card, Flex, Spin, Typography } from 'antd';
import { errorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth-service';
import { resetAuthBootstrap } from './bootstrap';
import { GoogleSignInButton } from './google-sign-in-button';
import { ensureSession, hasConsoleAccess } from './route-guards';

const CARD_WIDTH = 360;
const NOT_AN_ADMIN = 'Tài khoản Google này không có quyền vào bảng điều khiển.';
const SIGN_IN_FAILED = 'Không đăng nhập được.';

export function LoginPanel() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = useCallback(
    async (credential: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await authService.googleOneTap(credential);
        resetAuthBootstrap();
        await ensureSession();
        if (!hasConsoleAccess()) {
          setError(NOT_AN_ADMIN);
          return;
        }
        await navigate({ to: '/' });
      } catch (caught) {
        setError(errorMessage(caught, SIGN_IN_FAILED));
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  const onCredential = useCallback((credential: string) => void signIn(credential), [signIn]);
  const onUnavailable = useCallback((message: string) => setError(message), []);

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: CARD_WIDTH }}>
        <Flex vertical gap={20}>
          <Flex vertical gap={4}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Bảng điều khiển
            </Typography.Title>
            <Typography.Text type="secondary">
              Đăng nhập bằng tài khoản Google đã được cấp quyền quản trị.
            </Typography.Text>
          </Flex>

          {isSubmitting ? (
            <Flex justify="center">
              <Spin />
            </Flex>
          ) : (
            <GoogleSignInButton onCredential={onCredential} onUnavailable={onUnavailable} />
          )}

          {error ? <Alert type="error" showIcon message={error} /> : null}
        </Flex>
      </Card>
    </Flex>
  );
}
