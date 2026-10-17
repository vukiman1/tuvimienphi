import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CalendarType,
  Gender,
  LuanGiaiChapterStatus,
  type BirthInput,
} from '@org/shared-contracts';
import { ApiError } from '@/lib/api-error';
import { httpRequest } from '@/lib/http-request';
import { LuanGiaiChapterContent } from './luan-giai-chapter-content';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(), post: jest.fn() },
}));

const HTTP_PAYMENT_REQUIRED = 402;
const HTTP_SERVICE_UNAVAILABLE = 503;
const OUT_OF_LUOT_MESSAGE = 'Bạn đã dùng hết 3 lượt miễn phí hôm nay.';
const SERVICE_DOWN_MESSAGE = 'Hệ thống đang bận, thử lại sau nhé.';

const BIRTH: BirthInput = {
  day: 1,
  month: 1,
  year: 1990,
  calendar: CalendarType.Solar,
  hour: 'Tý',
  gender: Gender.Male,
};

const CHAPTER = { order: '01', title: 'Thân cư', iconUrl: '' };

function renderChapter(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <LuanGiaiChapterContent
        birth={BIRTH}
        chapter={CHAPTER}
        status={LuanGiaiChapterStatus.Pending}
      />
    </QueryClientProvider>,
  );
}

function failChapterRequest(statusCode: number, message: string): void {
  jest
    .mocked(httpRequest.post)
    .mockRejectedValue(new ApiError({ statusCode, errors: { message } } as never));
}

describe('LuanGiaiChapterContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(httpRequest.get).mockResolvedValue({
      qrImageUrl: 'https://qr.sepay.vn/img',
      bankCode: 'MBBank',
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN A',
      amountVnd: 5_000,
      transferContent: 'TVMP AB23CD45',
      creditsPerPayment: 5,
      dailyLimit: 3,
      dailyRemaining: 0,
      chapterCredits: 0,
    } as never);
  });

  it('opens the top-up dialog when the chapter request comes back 402', async () => {
    failChapterRequest(HTTP_PAYMENT_REQUIRED, OUT_OF_LUOT_MESSAGE);

    renderChapter();
    fireEvent.click(screen.getByRole('button', { name: 'Xem luận giải' }));

    expect(await screen.findByText('Bạn đã hết lượt miễn phí hôm nay')).toBeTruthy();
  });

  it('shows the plain error for any other failure', async () => {
    failChapterRequest(HTTP_SERVICE_UNAVAILABLE, SERVICE_DOWN_MESSAGE);

    renderChapter();
    fireEvent.click(screen.getByRole('button', { name: 'Xem luận giải' }));

    expect(await screen.findByText(SERVICE_DOWN_MESSAGE)).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
