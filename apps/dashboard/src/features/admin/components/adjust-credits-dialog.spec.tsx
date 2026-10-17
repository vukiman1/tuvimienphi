import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphqlError, graphqlRequest } from '../../../lib/graphql-request';
import type { AdminUserRow } from '../data/admin-users.query';
import { AdjustCreditsDialog } from './adjust-credits-dialog';

vi.mock('../../../lib/graphql-request', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/graphql-request')>()),
  graphqlRequest: vi.fn(),
}));

const USER_ID = 'user-1';

function userWithCredits(chapterCredits: number): AdminUserRow {
  return {
    id: USER_ID,
    email: 'an@example.com',
    displayName: 'An',
    avatar: null,
    role: 'USER',
    isEmailVerified: true,
    balance: 0,
    chapterCredits,
    createdAt: '2026-10-01T00:00:00.000Z',
    genCount: 0,
    lastActiveAt: null,
  };
}

function renderDialog(user: AdminUserRow) {
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdjustCreditsDialog user={user} onClose={onClose} />
    </QueryClientProvider>,
  );
  return onClose;
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: /^(loading )?(OK|Lưu)$/ });
}

function typeDelta(value: number): void {
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(value) } });
}

describe('AdjustCreditsDialog', () => {
  beforeEach(() => {
    vi.mocked(graphqlRequest).mockReset();
  });

  it('disables saving when the result would go below zero', () => {
    renderDialog(userWithCredits(2));

    typeDelta(-3);

    expect(screen.getByText('Sau khi chỉnh: -1 lượt')).toBeTruthy();
    expect(saveButton()).toHaveProperty('disabled', true);
  });

  it('disables saving while the delta is zero', () => {
    renderDialog(userWithCredits(2));

    expect(screen.getByText('Sau khi chỉnh: 2 lượt')).toBeTruthy();
    expect(saveButton()).toHaveProperty('disabled', true);
  });

  it('sends the delta and closes on success', async () => {
    vi.mocked(graphqlRequest).mockResolvedValue({
      adjustChapterCredits: { userId: USER_ID, chapterCredits: 7 },
    });
    const onClose = renderDialog(userWithCredits(2));

    typeDelta(5);
    fireEvent.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(graphqlRequest).toHaveBeenCalledWith(expect.anything(), {
      input: { userId: USER_ID, delta: 5 },
    });
  });

  it('shows the failure and stays open when saving is rejected', async () => {
    vi.mocked(graphqlRequest).mockRejectedValue(
      new GraphqlError([{ message: 'Không thể trừ quá số lượt.', extensions: { code: 400 } }]),
    );
    const onClose = renderDialog(userWithCredits(2));

    typeDelta(-1);
    fireEvent.click(saveButton());

    expect(await screen.findByText('Không thể trừ quá số lượt.')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
