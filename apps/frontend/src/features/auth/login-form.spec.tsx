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
  await screen.findByRole('button', { name: 'Sign in' });
}

describe('LoginForm', () => {
  it('asks the person to check their network when the server cannot be reached', async () => {
    jest.mocked(authService.login).mockRejectedValue(new Error('Network Error'));
    await renderLoginForm();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Chưa kết nối được tới máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.'),
    ).toBeTruthy();
  });
});
