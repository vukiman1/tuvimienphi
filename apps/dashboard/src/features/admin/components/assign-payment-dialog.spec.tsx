import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphqlError, graphqlRequest } from '../../../lib/graphql-request';
import type { AdminPaymentRow } from '../data/admin-payments.query';
import { AssignPaymentDialog } from './assign-payment-dialog';

vi.mock('../../../lib/graphql-request', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/graphql-request')>()),
  graphqlRequest: vi.fn(),
}));

const PAYMENT_ID = 'payment-1';
const USER_EMAIL = 'an@example.com';

function unmatchedPayment(suggestedCredits: number): AdminPaymentRow {
  return {
    id: PAYMENT_ID,
    amountVnd: 5000,
    content: 'chuyen tien',
    referenceCode: 'FT26289',
    status: 'Unmatched',
    unmatchedReason: 'NoCode',
    creditsGranted: 0,
    suggestedCredits,
    userEmail: null,
    transactionAt: '2026-10-16T03:00:00.000Z',
  };
}

function renderDialog(payment: AdminPaymentRow) {
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AssignPaymentDialog payment={payment} onClose={onClose} />
    </QueryClientProvider>,
  );
  return onClose;
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: /^(loading )?(OK|Cộng lượt)$/ });
}

function typeEmail(value: string): void {
  fireEvent.change(screen.getByRole('textbox'), { target: { value } });
}

describe('AssignPaymentDialog', () => {
  beforeEach(() => {
    vi.mocked(graphqlRequest).mockReset();
  });

  it('prefills the credits with the suggested amount', () => {
    renderDialog(unmatchedPayment(10));

    expect(screen.getByRole('spinbutton')).toHaveProperty('value', '10');
  });

  it('prefills at least one credit when the transfer is below the price', () => {
    renderDialog(unmatchedPayment(0));

    expect(screen.getByRole('spinbutton')).toHaveProperty('value', '1');
  });

  it('disables saving until an email is entered', () => {
    renderDialog(unmatchedPayment(5));

    expect(saveButton()).toHaveProperty('disabled', true);
  });

  it('submits the payment, email and credits then closes', async () => {
    vi.mocked(graphqlRequest).mockResolvedValue({
      assignPayment: {
        id: PAYMENT_ID,
        status: 'Credited',
        creditsGranted: 5,
        userEmail: USER_EMAIL,
      },
    });
    const onClose = renderDialog(unmatchedPayment(5));

    typeEmail(USER_EMAIL);
    fireEvent.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(graphqlRequest).toHaveBeenCalledWith(expect.anything(), {
      input: { paymentId: PAYMENT_ID, userEmail: USER_EMAIL, credits: 5 },
    });
  });

  it('shows the rejection and stays open', async () => {
    vi.mocked(graphqlRequest).mockRejectedValue(
      new GraphqlError([{ message: 'Giao dịch này đã được cộng rồi.', extensions: { code: 400 } }]),
    );
    const onClose = renderDialog(unmatchedPayment(5));

    typeEmail(USER_EMAIL);
    fireEvent.click(saveButton());

    expect(await screen.findByText('Giao dịch này đã được cộng rồi.')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
