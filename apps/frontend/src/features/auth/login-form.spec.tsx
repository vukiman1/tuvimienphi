import { fireEvent, render, screen } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { authService } from '@/services/auth-service';
import { LoginForm } from './login-form';

jest.mock('@/services/auth-service', () => ({
  authService: { login: jest.fn() },
}));
jest.mock('@/lib/toast', () => ({
  notify: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

async function renderLoginForm(): Promise<void> {
  const rootRoute = createRootRoute({
    component: () => <LoginForm onForgotPassword={jest.fn()} />,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/?auth=login'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByRole('button', { name: 'Đăng nhập' });
}

function fillCredentials(): void {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'reader@example.com' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'Reader1234' } });
}

describe('LoginForm', () => {
  it('opens with an empty email and password', async () => {
    await renderLoginForm();

    expect(screen.getByLabelText('Email')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Mật khẩu')).toHaveProperty('value', '');
  });

  it('asks the person to check their network when the server cannot be reached', async () => {
    jest.mocked(authService.login).mockRejectedValue(new Error('Network Error'));
    await renderLoginForm();
    fillCredentials();

    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(
      await screen.findByText('Chưa kết nối được tới máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.'),
    ).toBeTruthy();
  });
});
