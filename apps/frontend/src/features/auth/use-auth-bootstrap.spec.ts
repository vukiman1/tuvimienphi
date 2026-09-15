import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import { bootstrapAuth, resetAuthBootstrapForTests } from './use-auth-bootstrap';

jest.mock('@/services/auth-service', () => ({
  authService: { getSessionStatus: jest.fn(), refreshToken: jest.fn(), getMe: jest.fn() },
}));

const USER = { email: 'a@example.com', displayName: 'A' };

describe('bootstrapAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAuthBootstrapForTests();
    useAuthStore.getState().reset();
  });

  it('asks once and stays signed out for a first-time visitor, without refreshing', async () => {
    jest.mocked(authService.getSessionStatus).mockResolvedValue({ user: null, canRefresh: false });

    await bootstrapAuth();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isInitializing).toBe(false);
    expect(authService.refreshToken).not.toHaveBeenCalled();
    expect(authService.getMe).not.toHaveBeenCalled();
  });

  it('signs in straight from the session check while the access token is valid', async () => {
    jest.mocked(authService.getSessionStatus).mockResolvedValue({ user: USER, canRefresh: true });

    await bootstrapAuth();

    expect(useAuthStore.getState().user).toEqual(USER);
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it('refreshes a lapsed session before loading the user', async () => {
    jest.mocked(authService.getSessionStatus).mockResolvedValue({ user: null, canRefresh: true });
    jest.mocked(authService.refreshToken).mockResolvedValue({ user: USER } as never);
    jest.mocked(authService.getMe).mockResolvedValue({ user: USER });

    await bootstrapAuth();

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(USER);
  });

  it('stays signed out when the server refuses the refresh', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.mocked(authService.getSessionStatus).mockResolvedValue({ user: null, canRefresh: true });
    jest.mocked(authService.refreshToken).mockRejectedValue(new Error('401'));

    await bootstrapAuth();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });
});
