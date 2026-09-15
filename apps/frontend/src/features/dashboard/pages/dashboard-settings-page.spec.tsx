import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardSettingsPage } from './dashboard-settings-page';
import { authService } from '@/services/auth-service';

jest.mock('@/services/auth-service', () => ({
  authService: { getMe: jest.fn(), getTwoFactorStatus: jest.fn() },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardSettingsPage />
    </QueryClientProvider>,
  );
}

describe('DashboardSettingsPage', () => {
  it('shows the profile, password and two-factor cards but leaves sessions to their own tab', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'a@b.c', avatar: null, isEmailVerified: true, hasPassword: true },
    } as never);
    jest
      .mocked(authService.getTwoFactorStatus)
      .mockResolvedValue({ enabled: false, unusedRecoveryCodes: 0 });

    renderPage();

    expect(await screen.findByText('a@b.c')).toBeTruthy();
    expect(await screen.findByText('Mật khẩu')).toBeTruthy();
    expect(await screen.findByText('Xác thực 2 bước')).toBeTruthy();
    expect(screen.queryByText('Phiên đăng nhập')).toBeNull();
  });
});
