import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AVATAR_MAX_BYTES } from '@org/shared-contracts';
import { ProfileCard } from './profile-card';
import { authService } from '@/services/auth-service';
import { userService } from '@/services/user-service';
import { notify } from '@/lib/toast';

jest.mock('@/services/auth-service', () => ({
  authService: { getMe: jest.fn() },
}));
jest.mock('@/services/user-service', () => ({
  userService: { uploadAvatar: jest.fn() },
}));
jest.mock('@/lib/toast', () => ({
  notify: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

function renderCard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileCard />
    </QueryClientProvider>,
  );
}

function chooseAvatarFile(file: File) {
  fireEvent.change(screen.getByLabelText('Chọn ảnh đại diện'), { target: { files: [file] } });
}

describe('ProfileCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the email and the avatar image when the account has one', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: {
        email: 'jane@example.com',
        avatar: 'https://pic/a.png',
        isEmailVerified: true,
        hasPassword: true,
      },
    } as never);

    renderCard();

    expect(await screen.findByText('jane@example.com')).toBeTruthy();
    expect(screen.getByAltText('jane@example.com')).toBeTruthy();
  });

  it('shows the display name above the email when the account has one', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: {
        email: 'jane@example.com',
        displayName: 'Jane Doe',
        avatar: null,
        isEmailVerified: true,
        hasPassword: true,
      },
    } as never);

    renderCard();

    expect((await screen.findByRole('heading')).textContent).toBe('Jane Doe');
    expect(screen.getByText('jane@example.com')).toBeTruthy();
  });

  it('names the account by its email when it has no display name', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: {
        email: 'jane@example.com',
        displayName: null,
        avatar: null,
        isEmailVerified: true,
        hasPassword: true,
      },
    } as never);

    renderCard();

    expect((await screen.findByRole('heading')).textContent).toBe('jane@example.com');
  });

  it('falls back to the first letter of the email when there is no avatar', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'jane@example.com', avatar: null, isEmailVerified: true, hasPassword: true },
    } as never);

    renderCard();

    expect(await screen.findByText('J')).toBeTruthy();
    expect(screen.queryByAltText('jane@example.com')).toBeNull();
  });

  it('says no password is set for a Google account', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'g@example.com', avatar: null, isEmailVerified: true, hasPassword: false },
    } as never);

    renderCard();

    expect(await screen.findByText('Chưa đặt mật khẩu')).toBeTruthy();
  });

  it('flags an unverified email', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'a@b.c', avatar: null, isEmailVerified: false, hasPassword: true },
    } as never);

    renderCard();

    expect(await screen.findByText('Email chưa xác thực')).toBeTruthy();
  });

  it('shows the new avatar once an upload succeeds', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'jane@example.com', avatar: null, isEmailVerified: true, hasPassword: true },
    } as never);
    jest
      .mocked(userService.uploadAvatar)
      .mockResolvedValue({ avatar: 'https://media.example.com/avatars/u/new.png' });
    renderCard();
    await screen.findByText('jane@example.com');

    const image = new File(['png-bytes'], 'me.png', { type: 'image/png' });
    chooseAvatarFile(image);

    await waitFor(() =>
      expect(screen.getByAltText('jane@example.com').getAttribute('src')).toBe(
        'https://media.example.com/avatars/u/new.png',
      ),
    );
    expect(userService.uploadAvatar).toHaveBeenCalledWith(image);
  });

  it('refuses an image over the size limit without uploading it', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'jane@example.com', avatar: null, isEmailVerified: true, hasPassword: true },
    } as never);
    renderCard();
    await screen.findByText('jane@example.com');

    chooseAvatarFile(
      new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], 'big.png', { type: 'image/png' }),
    );

    expect(notify.error).toHaveBeenCalledWith('Ảnh phải nhỏ hơn 2MB.');
    expect(userService.uploadAvatar).not.toHaveBeenCalled();
  });

  it('refuses a file that is not a supported image without uploading it', async () => {
    jest.mocked(authService.getMe).mockResolvedValue({
      user: { email: 'jane@example.com', avatar: null, isEmailVerified: true, hasPassword: true },
    } as never);
    renderCard();
    await screen.findByText('jane@example.com');

    chooseAvatarFile(new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' }));

    expect(notify.error).toHaveBeenCalledWith('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
    expect(userService.uploadAvatar).not.toHaveBeenCalled();
  });
});
