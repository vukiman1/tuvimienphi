import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { DashboardSessionsPage } from './dashboard-sessions-page';
import { authService } from '@/services/auth-service';

jest.mock('@/services/auth-service', () => ({
  authService: { getSessions: jest.fn() },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <DashboardSessionsPage />
      </ConfirmProvider>
    </QueryClientProvider>,
  );
}

describe('DashboardSessionsPage', () => {
  it('shows the login sessions card', async () => {
    jest.mocked(authService.getSessions).mockResolvedValue({ sessions: [] } as never);

    renderPage();

    expect(await screen.findByRole('button', { name: 'Refresh sessions' })).toBeTruthy();
  });
});
