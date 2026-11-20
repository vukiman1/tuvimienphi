import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import type { AdminUsersQuery, Role } from '../../../gql/graphql';
import { GraphqlError, graphqlRequest } from '../../../lib/graphql-request';
import {
  DEFAULT_USERS_FILTERS,
  USERS_QUERY_KEY,
  type AdminUserRow,
} from '../data/admin-users.query';
import { ChangeRoleDialog } from './change-role-dialog';

vi.mock('../../../lib/graphql-request', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/graphql-request')>()),
  graphqlRequest: vi.fn(),
}));

const USER_ID = 'user-1';
const EMAIL = 'an@example.com';
const LIST_KEY = [...USERS_QUERY_KEY, DEFAULT_USERS_FILTERS];

function userWithRole(role: Role): AdminUserRow {
  return {
    id: USER_ID,
    email: EMAIL,
    displayName: 'An',
    avatar: null,
    role,
    isEmailVerified: true,
    balance: 0,
    chapterCredits: 0,
    dailyChapterUsed: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    genCount: 0,
    lastActiveAt: null,
  };
}

interface RenderedDialog {
  readonly onClose: Mock;
  readonly queryClient: QueryClient;
}

function renderDialog(user: AdminUserRow): RenderedDialog {
  const onClose = vi.fn();
  const queryClient = new QueryClient();
  queryClient.setQueryData<AdminUsersQuery>(LIST_KEY, { users: { total: 1, users: [user] } });
  render(
    <QueryClientProvider client={queryClient}>
      <App>
        <ChangeRoleDialog user={user} onClose={onClose} />
      </App>
    </QueryClientProvider>,
  );
  return { onClose, queryClient };
}

function primaryButton(name: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`^(loading )?${name}$`) });
}

function chooseAndConfirm(roleLabel: string): void {
  fireEvent.click(screen.getByLabelText(roleLabel));
  fireEvent.click(primaryButton('Tiếp tục'));
}

describe('ChangeRoleDialog', () => {
  beforeEach(() => {
    vi.mocked(graphqlRequest).mockReset();
  });

  it('will not continue while the current role is still selected', () => {
    renderDialog(userWithRole('USER'));

    expect(primaryButton('Tiếp tục')).toHaveProperty('disabled', true);
  });

  it('asks to confirm by email before granting admin, and sends nothing until confirmed', () => {
    renderDialog(userWithRole('USER'));

    chooseAndConfirm('Quản trị viên');

    expect(screen.getByText(`Cấp quyền quản trị cho ${EMAIL}?`)).toBeTruthy();
    expect(graphqlRequest).not.toHaveBeenCalled();
  });

  it('words the confirmation as a revocation when taking admin away', () => {
    renderDialog(userWithRole('ADMIN'));

    chooseAndConfirm('Người dùng');

    expect(screen.getByText(`Thu hồi quyền quản trị của ${EMAIL}?`)).toBeTruthy();
  });

  it('sends the chosen role once confirmed, updates the row and closes', async () => {
    vi.mocked(graphqlRequest).mockResolvedValue({ setUserRole: userWithRole('ADMIN') });
    const { onClose, queryClient } = renderDialog(userWithRole('USER'));

    chooseAndConfirm('Quản trị viên');
    fireEvent.click(primaryButton('Xác nhận'));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(graphqlRequest).toHaveBeenCalledWith(expect.anything(), {
      userId: USER_ID,
      role: 'ADMIN',
    });
    expect(queryClient.getQueryData<AdminUsersQuery>(LIST_KEY)?.users.users[0].role).toBe('ADMIN');
    expect(await screen.findByText(`Đã cấp quyền quản trị cho ${EMAIL}.`)).toBeTruthy();
  });

  it('shows the server’s reason and stays open when the change is refused', async () => {
    vi.mocked(graphqlRequest).mockRejectedValue(
      new GraphqlError([
        {
          message: 'Không thể đổi quyền của quản trị viên cấp cao.',
          extensions: { code: 400 },
        },
      ]),
    );
    const { onClose } = renderDialog(userWithRole('USER'));

    chooseAndConfirm('Quản trị viên');
    fireEvent.click(primaryButton('Xác nhận'));

    expect(await screen.findByText('Không thể đổi quyền của quản trị viên cấp cao.')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
