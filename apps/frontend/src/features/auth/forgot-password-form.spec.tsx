import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { authService } from '@/services/auth-service';
import { notify } from '@/lib/toast';
import { ForgotPasswordForm } from './forgot-password-form';

jest.mock('@/services/auth-service', () => ({
  authService: { forgotPassword: jest.fn(), resetPassword: jest.fn() },
}));
jest.mock('@/lib/toast', () => ({
  notify: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const EMAIL = 'person@example.com';
const STRONG_PASSWORD = 'Str0ngPass!';

async function requestCode(): Promise<void> {
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: EMAIL } });
  fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
  await screen.findByLabelText('Verification code');
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resets the password of the address the code was sent to', async () => {
    jest.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' } as never);
    jest.mocked(authService.resetPassword).mockResolvedValue({ message: 'ok' } as never);
    const onDone = jest.fn();

    render(<ForgotPasswordForm onDone={onDone} />);
    await requestCode();
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: STRONG_PASSWORD } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: STRONG_PASSWORD },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() =>
      expect(authService.resetPassword).toHaveBeenCalledWith({
        email: EMAIL,
        code: '123456',
        password: STRONG_PASSWORD,
        confirmPassword: STRONG_PASSWORD,
      }),
    );
    expect(notify.success).toHaveBeenCalledWith('Password updated. Every device was signed out.');
    expect(onDone).toHaveBeenCalled();
  });
});
