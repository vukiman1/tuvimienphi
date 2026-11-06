import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EMAIL_CODE_RESEND_COOLDOWN_SECONDS } from '@org/shared-contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecurityCard } from './security-card';
import { authService } from '@/services/auth-service';
import { notify } from '@/lib/toast';

jest.mock('@/services/auth-service', () => ({
  authService: {
    getMe: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    setPassword: jest.fn(),
  },
}));

const MS_PER_SECOND = 1000;
const STRONG_PASSWORD = 'Str0ngPass!';
jest.mock('@/lib/toast', () => ({
  notify: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

function renderCard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SecurityCard />
    </QueryClientProvider>,
  );
}

function mockAccount(hasPassword: boolean, email = 'a@b.c') {
  jest.mocked(authService.getMe).mockResolvedValue({ user: { email, hasPassword } } as never);
}

async function openChangeForm() {
  fireEvent.click(await screen.findByRole('button', { name: 'Đổi mật khẩu' }));
  return screen.findByLabelText('Current password');
}

async function fillAndSubmit() {
  fireEvent.change(await openChangeForm(), { target: { value: 'old-one' } });
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: STRONG_PASSWORD } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: { value: STRONG_PASSWORD },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
}

async function startSettingPassword() {
  fireEvent.click(await screen.findByRole('button', { name: 'Đặt mật khẩu' }));
  return screen.findByLabelText('Verification code');
}

function fillCodeAndPassword(code: string) {
  fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: code } });
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: STRONG_PASSWORD } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: { value: STRONG_PASSWORD },
  });
}

describe('SecurityCard', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.useRealTimers());

  it('keeps the change form behind a button for an account that has a password', async () => {
    mockAccount(true);

    renderCard();

    expect(await screen.findByRole('button', { name: 'Đổi mật khẩu' })).toBeTruthy();
    expect(screen.queryByLabelText('Current password')).toBeNull();
  });

  it('opens the form in a dialog', async () => {
    mockAccount(true);

    renderCard();

    expect(await openChangeForm()).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('offers an email link instead when the account has no password', async () => {
    mockAccount(false, 'g@b.c');

    renderCard();

    expect(await screen.findByRole('button', { name: 'Đặt mật khẩu' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Đổi mật khẩu' })).toBeNull();
  });

  it('emails a code to the account address and asks for it right here', async () => {
    mockAccount(false, 'g@b.c');
    jest.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' } as never);

    renderCard();
    await startSettingPassword();

    expect(authService.forgotPassword).toHaveBeenCalledWith('g@b.c');
    expect(notify.success).toHaveBeenCalledWith('Đã gửi mã tới g@b.c.');
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('sets the password with the emailed code and keeps this device signed in', async () => {
    mockAccount(false, 'g@b.c');
    jest.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' } as never);
    jest.mocked(authService.setPassword).mockResolvedValue({ message: 'ok' } as never);

    renderCard();
    await startSettingPassword();
    fillCodeAndPassword('123456');
    fireEvent.click(screen.getByRole('button', { name: 'Set password' }));

    await waitFor(() =>
      expect(authService.setPassword).toHaveBeenCalledWith({
        code: '123456',
        password: STRONG_PASSWORD,
        confirmPassword: STRONG_PASSWORD,
      }),
    );
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Password set. Other devices were signed out.'),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(authService.getMe).toHaveBeenCalledTimes(2));
  });

  it('waits a minute before another code can be sent', async () => {
    mockAccount(false, 'g@b.c');
    jest.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' } as never);

    renderCard();
    await startSettingPassword();

    const resend = screen.getByRole('button', { name: 'Send another code in 60s' });
    expect(resend.hasAttribute('disabled')).toBe(true);
  });

  it('sends another code to the same address once the minute is up', async () => {
    jest.useFakeTimers();
    mockAccount(false, 'g@b.c');
    jest.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' } as never);

    renderCard();
    await startSettingPassword();
    act(() => jest.advanceTimersByTime(EMAIL_CODE_RESEND_COOLDOWN_SECONDS * MS_PER_SECOND));
    fireEvent.click(screen.getByRole('button', { name: 'Send another code' }));

    await waitFor(() => expect(authService.forgotPassword).toHaveBeenCalledTimes(2));
    expect(authService.forgotPassword).toHaveBeenLastCalledWith('g@b.c');
  });

  it('shows the server message in the dialog when the current password is wrong', async () => {
    mockAccount(true);
    jest
      .mocked(authService.changePassword)
      .mockRejectedValue(new Error('Current password is incorrect'));

    renderCard();
    await fillAndSubmit();

    expect(await screen.findByText('Current password is incorrect')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('closes the dialog and reports success after a change', async () => {
    mockAccount(true);
    jest.mocked(authService.changePassword).mockResolvedValue({ message: 'ok' } as never);

    renderCard();
    await fillAndSubmit();

    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith(
        'Password updated. Other devices were signed out.',
      ),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
