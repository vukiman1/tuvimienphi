import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CreditCheckout, CreditSummary } from '@org/shared-contracts';
import { ApiError } from '@/lib/api-error';
import { creditsQueries } from '@/features/credits/credits-queries';
import { httpRequest } from '@/lib/http-request';
import { TopUpDialog } from './top-up-dialog';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(), post: jest.fn() },
}));

const POLL_INTERVAL_MS = 3_000;
const HTTP_CONFLICT = 409;
const CHECKOUT_CLOSED_MESSAGE = 'Chức năng nạp lượt đang tạm đóng.';

const CHECKOUT: CreditCheckout = {
  qrImageUrl: 'https://qr.sepay.vn/img?acc=123&amount=5000',
  bankCode: 'MBBank',
  accountNumber: '0123456789',
  accountName: 'NGUYEN VAN A',
  amountVnd: 5_000,
  transferContent: 'TVMP AB23CD45',
  creditsPerPayment: 5,
};

function summary(chapterCredits: number): CreditSummary {
  return { dailyLimit: 3, dailyRemaining: 0, chapterCredits };
}

function mockEndpoints(summaries: readonly CreditSummary[]): void {
  let summaryCalls = 0;
  jest.mocked(httpRequest.get).mockImplementation((async (path: string) => {
    if (path === '/credits/checkout') return CHECKOUT;
    const next = summaries[Math.min(summaryCalls, summaries.length - 1)];
    summaryCalls += 1;
    return next;
  }) as never);
}

function renderDialog(
  onToppedUp: () => void = jest.fn(),
  queryClient: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
): void {
  render(
    <QueryClientProvider client={queryClient}>
      <TopUpDialog onOpenChange={jest.fn()} onToppedUp={onToppedUp} open />
    </QueryClientProvider>,
  );
}

describe('TopUpDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('shows the QR and transfer content from checkout', async () => {
    mockEndpoints([summary(0)]);

    renderDialog();

    const qr = await screen.findByRole('img');
    expect(qr.getAttribute('src')).toBe(CHECKOUT.qrImageUrl);
    expect(screen.getByText(CHECKOUT.transferContent)).toBeTruthy();
    expect(screen.getByText(CHECKOUT.accountNumber)).toBeTruthy();
    expect(screen.getByText(/Chuyển khoản 5\.000đ để nhận thêm 5 lượt/)).toBeTruthy();
  });

  it('announces the top-up once the credit balance rises', async () => {
    mockEndpoints([summary(0), summary(5)]);
    const onToppedUp = jest.fn();

    renderDialog(onToppedUp);
    await screen.findByRole('img');
    expect(screen.queryByText(/Đã nhận!/)).toBeNull();

    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS));

    expect(await screen.findByText('Đã nhận! Bạn có 5 lượt.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Xem luận giải' }));
    expect(onToppedUp).toHaveBeenCalledTimes(1);
  });

  it('ignores a stale cached balance when the refetch on open fails', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(creditsQueries.summary().queryKey, summary(5));
    const summaries = [new Error('network down'), summary(10), summary(15)];
    let summaryCalls = 0;
    jest.mocked(httpRequest.get).mockImplementation((async (path: string) => {
      if (path === '/credits/checkout') return CHECKOUT;
      const next = summaries[Math.min(summaryCalls, summaries.length - 1)];
      summaryCalls += 1;
      if (next instanceof Error) throw next;
      return next;
    }) as never);

    renderDialog(jest.fn(), queryClient);
    await screen.findByRole('img');
    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS));
    expect(screen.queryByText(/Đã nhận!/)).toBeNull();

    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS));
    expect(await screen.findByText('Đã nhận! Bạn có 15 lượt.')).toBeTruthy();
  });

  it('shows the gift-code copy, not the paid copy, after a redemption raises the balance', async () => {
    mockEndpoints([summary(0), summary(5), summary(5)]);
    jest
      .mocked(httpRequest.post)
      .mockResolvedValue({ creditsGranted: 5, chapterCredits: 5 } as never);
    const onToppedUp = jest.fn();

    renderDialog(onToppedUp);
    await screen.findByRole('img');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'WELCOME5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(await screen.findByText('Đã cộng 5 lượt.')).toBeTruthy();
    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS));
    expect(screen.queryByText(/Đã nhận!/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem luận giải' }));
    expect(onToppedUp).toHaveBeenCalledTimes(1);
  });

  it('still lets a gift code be redeemed when checkout is unavailable', async () => {
    jest.mocked(httpRequest.get).mockImplementation((async (path: string) => {
      if (path === '/credits/checkout') {
        throw new ApiError({
          statusCode: HTTP_CONFLICT,
          success: false,
          errors: { message: CHECKOUT_CLOSED_MESSAGE },
        });
      }
      return summary(0);
    }) as never);
    jest
      .mocked(httpRequest.post)
      .mockResolvedValue({ creditsGranted: 3, chapterCredits: 3 } as never);

    renderDialog();
    expect(await screen.findByText(CHECKOUT_CLOSED_MESSAGE)).toBeTruthy();
    expect(await screen.findByText('Hoặc nhập giftcode')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'WELCOME3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(await screen.findByText('Đã cộng 3 lượt.')).toBeTruthy();
  });

  it('copies the transfer content to the clipboard', async () => {
    mockEndpoints([summary(0)]);
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderDialog();
    await screen.findByRole('img');
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép nội dung chuyển khoản' }));

    expect(writeText).toHaveBeenCalledWith(CHECKOUT.transferContent);
  });
});
