import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphqlError, graphqlRequest } from '../../../lib/graphql-request';
import { DailyQuotaSetting } from './daily-quota-setting';

vi.mock('../../../lib/graphql-request', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/graphql-request')>()),
  graphqlRequest: vi.fn(),
}));

function renderSetting(dailyChapterQuota: number): void {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DailyQuotaSetting dailyChapterQuota={dailyChapterQuota} />
    </QueryClientProvider>,
  );
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: /Lưu/ });
}

function typeQuota(value: number): void {
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(value) } });
}

describe('DailyQuotaSetting', () => {
  beforeEach(() => {
    vi.mocked(graphqlRequest).mockReset();
  });

  it('keeps saving disabled until the limit changes', () => {
    renderSetting(3);

    expect(saveButton()).toHaveProperty('disabled', true);
  });

  it('saves zero so admins can switch free lượt off', async () => {
    vi.mocked(graphqlRequest).mockResolvedValue({ updateCreditSettings: { dailyChapterQuota: 0 } });
    renderSetting(3);

    typeQuota(0);
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(graphqlRequest).toHaveBeenCalledWith(expect.anything(), {
        input: { dailyChapterQuota: 0 },
      }),
    );
  });

  it('shows why the server rejected the new limit', async () => {
    vi.mocked(graphqlRequest).mockRejectedValue(
      new GraphqlError([{ message: 'Giới hạn không hợp lệ.', extensions: { code: 400 } }]),
    );
    renderSetting(3);

    typeQuota(10);
    fireEvent.click(saveButton());

    expect(await screen.findByText('Giới hạn không hợp lệ.')).toBeTruthy();
  });
});
