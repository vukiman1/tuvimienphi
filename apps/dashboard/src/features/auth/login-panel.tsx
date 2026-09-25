import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AppstoreFilled } from '@ant-design/icons';
import { Alert, Card, Flex, Spin, Typography } from 'antd';
import { errorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth-service';
import { resetAuthBootstrap } from './bootstrap';
import { GoogleSignInButton } from './google-sign-in-button';
import { LoginBackdrop } from './login-backdrop';
import { ensureSession, hasConsoleAccess } from './route-guards';

const CARD_WIDTH = 420;
const CARD_PADDING = 48;
const CARD_RADIUS = 24;
const CARD_SHADOW = '0 24px 60px rgba(30, 58, 138, 0.10)';
const PAGE_GUTTER = 24;
const OPTICAL_LIFT = 48;
const SIGN_IN_SLOT_HEIGHT = 56;
const BRAND_TILE_SIZE = 56;
const TITLE_SIZE = 34;
const TITLE_COLOR = '#1e2a4a';
const BRAND_TINT = '#e8edfd';
const BRAND_ICON_COLOR = '#4f7df3';
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
    <Flex
      align="center"
      justify="center"
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingInline: PAGE_GUTTER,
        paddingBottom: OPTICAL_LIFT,
      }}
    >
      <LoginBackdrop />

      <Card
        variant="borderless"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: CARD_WIDTH,
          borderRadius: CARD_RADIUS,
          boxShadow: CARD_SHADOW,
        }}
        styles={{ body: { padding: CARD_PADDING } }}
      >
        <Flex vertical align="center" gap={28}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: BRAND_TILE_SIZE,
              height: BRAND_TILE_SIZE,
              borderRadius: 16,
              background: BRAND_TINT,
            }}
          >
            <AppstoreFilled style={{ fontSize: 26, color: BRAND_ICON_COLOR }} />
          </Flex>

          <Flex vertical align="center" gap={8}>
            <Typography.Title
              level={2}
              style={{ margin: 0, fontSize: TITLE_SIZE, color: TITLE_COLOR }}
            >
              Dashboard
            </Typography.Title>
            <Typography.Text type="secondary">Đăng nhập để truy cập hệ thống</Typography.Text>
          </Flex>

          <Flex
            align="center"
            justify="center"
            style={{ minHeight: SIGN_IN_SLOT_HEIGHT, width: '100%' }}
          >
            {isSubmitting ? (
              <Spin />
            ) : (
              <GoogleSignInButton onCredential={onCredential} onUnavailable={onUnavailable} />
            )}
          </Flex>

          {error ? <Alert type="error" showIcon title={error} style={{ width: '100%' }} /> : null}
        </Flex>
      </Card>
    </Flex>
  );
}
