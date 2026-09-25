import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Moon } from 'lucide-react';
import { errorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth-service';
import { resetAuthBootstrap } from './bootstrap';
import { GoogleSignInButton } from './google-sign-in-button';
import { ensureSession, hasConsoleAccess } from './route-guards';

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Moon className="size-5 text-primary" />
          <h1 className="font-seal text-lg leading-none text-primary">Bảng điều khiển</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Đăng nhập bằng tài khoản Google đã được cấp quyền quản trị.
        </p>

        {isSubmitting ? (
          <p className="text-sm text-muted-foreground">Đang đăng nhập…</p>
        ) : (
          <GoogleSignInButton onCredential={onCredential} onUnavailable={onUnavailable} />
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
