import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { GraphqlError, graphqlRequest } from '../../../lib/graphql-request';
import { GiftCodeForm } from './gift-code-form';

vi.mock('../../../lib/graphql-request', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/graphql-request')>()),
  graphqlRequest: vi.fn(),
}));

const CODE_LABEL = 'Mã (để trống để tự tạo)';
const CREDITS_LABEL = 'Số lượt';
const MAX_REDEMPTIONS_LABEL = 'Số lần dùng tối đa';
const EXPIRY_LABEL = 'Hạn dùng';
const EXPIRY_TEXT = '2026-12-31 10:00';
const CREDITS = 10;
const MAX_REDEMPTIONS = 50;

function renderForm() {
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <GiftCodeForm open onClose={onClose} />
    </QueryClientProvider>,
  );
  return onClose;
}

function fillRequiredFields(): void {
  fireEvent.change(screen.getByLabelText(CREDITS_LABEL), { target: { value: String(CREDITS) } });
  fireEvent.change(screen.getByLabelText(MAX_REDEMPTIONS_LABEL), {
    target: { value: String(MAX_REDEMPTIONS) },
  });
}

function submit(): void {
  fireEvent.click(screen.getByRole('button', { name: /^(loading )?Tạo$/ }));
}

describe('GiftCodeForm', () => {
  beforeEach(() => {
    vi.mocked(graphqlRequest).mockReset();
  });

  it('submits without a code or expiry when both are left empty', async () => {
    vi.mocked(graphqlRequest).mockResolvedValue({ createGiftCode: { id: 'gift-1' } });
    const onClose = renderForm();

    fillRequiredFields();
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(graphqlRequest).toHaveBeenCalledWith(expect.anything(), {
      input: {
        code: undefined,
        credits: CREDITS,
        maxRedemptions: MAX_REDEMPTIONS,
        expiresAt: undefined,
      },
    });
  });

  it('submits the chosen expiry as an ISO string', async () => {
    vi.mocked(graphqlRequest).mockResolvedValue({ createGiftCode: { id: 'gift-1' } });
    renderForm();

    fireEvent.change(screen.getByLabelText(CODE_LABEL), { target: { value: 'SUMMER25' } });
    fillRequiredFields();
    const expiry = screen.getByLabelText(EXPIRY_LABEL);
    fireEvent.change(expiry, { target: { value: EXPIRY_TEXT } });
    fireEvent.keyDown(expiry, { key: 'Enter', keyCode: 13 });
    submit();

    await waitFor(() => expect(graphqlRequest).toHaveBeenCalledTimes(1));
    expect(graphqlRequest).toHaveBeenCalledWith(expect.anything(), {
      input: {
        code: 'SUMMER25',
        credits: CREDITS,
        maxRedemptions: MAX_REDEMPTIONS,
        expiresAt: dayjs(EXPIRY_TEXT).toISOString(),
      },
    });
  });

  it('shows the rejection and stays open', async () => {
    vi.mocked(graphqlRequest).mockRejectedValue(
      new GraphqlError([{ message: 'Mã này đã tồn tại.', extensions: { code: 400 } }]),
    );
    const onClose = renderForm();

    fillRequiredFields();
    submit();

    expect(await screen.findByText('Mã này đã tồn tại.')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
