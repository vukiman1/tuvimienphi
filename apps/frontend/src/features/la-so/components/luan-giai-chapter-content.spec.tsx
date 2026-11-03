import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CalendarType,
  Gender,
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiArticle,
  type LuanGiaiChapterStatusMap,
} from '@org/shared-contracts';
import { ApiError } from '@/lib/api-error';
import { httpRequest } from '@/lib/http-request';
import { luanGiaiQueries } from '@/features/la-so/luan-giai-queries';
import { LuanGiaiChapterContent } from './luan-giai-chapter-content';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(), post: jest.fn() },
}));

const HTTP_PAYMENT_REQUIRED = 402;
const HTTP_SERVICE_UNAVAILABLE = 503;
const OUT_OF_LUOT_MESSAGE = 'Bạn đã dùng hết lượt miễn phí hôm nay.';
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
const VAN_HAN = { order: '06', title: 'Vận hạn', iconUrl: '' };
const VIEW_YEAR = 2027;
const VAN_HAN_ARTICLE: LuanGiaiArticle = {
  eyebrow: 'Vận hạn',
  title: 'Vận hạn năm Đinh Mùi 2027',
  sourceCung: 'Thiên Di',
  quote: 'Năm của tình duyên',
  subheading: 'Nam tuổi Tý – Vận hạn năm Đinh Mùi 2027',
  paragraphs: ['Mở bài.', 'Đoạn một.', 'Đoạn hai.'],
  summary: 'Tóm lại.',
  closingLabel: 'Một lời dành cho bạn',
  closing: 'Lời kết.',
};

function newQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function chapterElement(
  queryClient: QueryClient,
  chapter: typeof CHAPTER,
  viewYear: number,
): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <LuanGiaiChapterContent
        birth={BIRTH}
        chapter={chapter}
        status={LuanGiaiChapterStatus.Pending}
        viewYear={viewYear}
      />
    </QueryClientProvider>
  );
}

function renderChapter(): void {
  render(chapterElement(newQueryClient(), CHAPTER, VIEW_YEAR));
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

  it('names the year on the vận hạn prompt and never requests it on its own when the year changes', () => {
    const queryClient = newQueryClient();
    const { rerender } = render(chapterElement(queryClient, VAN_HAN, 2026));

    rerender(chapterElement(queryClient, VAN_HAN, VIEW_YEAR));

    expect(screen.getByRole('button', { name: `Xem vận hạn năm ${VIEW_YEAR}` })).toBeTruthy();
    expect(httpRequest.post).not.toHaveBeenCalled();
  });

  it('unlocks the vận hạn chapter only for the year it was written for', async () => {
    const queryClient = newQueryClient();
    const locked: LuanGiaiChapterStatusMap = { chapters: { '06': LuanGiaiChapterStatus.Pending } };
    queryClient.setQueryData(luanGiaiQueries.statusMap(BIRTH, 2026).queryKey, locked);
    queryClient.setQueryData(luanGiaiQueries.statusMap(BIRTH, VIEW_YEAR).queryKey, locked);
    jest.mocked(httpRequest.post).mockResolvedValue({
      status: LuanGiaiChapterStatus.Ready,
      article: VAN_HAN_ARTICLE,
    });

    render(chapterElement(queryClient, VAN_HAN, VIEW_YEAR));
    fireEvent.click(screen.getByRole('button', { name: `Xem vận hạn năm ${VIEW_YEAR}` }));

    await waitFor(() =>
      expect(
        queryClient.getQueryData<LuanGiaiChapterStatusMap>(
          luanGiaiQueries.statusMap(BIRTH, VIEW_YEAR).queryKey,
        )?.chapters['06'],
      ).toBe(LuanGiaiChapterStatus.Ready),
    );
    expect(
      queryClient.getQueryData<LuanGiaiChapterStatusMap>(
        luanGiaiQueries.statusMap(BIRTH, 2026).queryKey,
      )?.chapters['06'],
    ).toBe(LuanGiaiChapterStatus.Pending);
  });

  it('says so when the picked year cannot be read for this chart', async () => {
    jest.mocked(httpRequest.post).mockResolvedValue({ status: LuanGiaiChapterStatus.Unavailable });

    render(chapterElement(newQueryClient(), VAN_HAN, VIEW_YEAR));
    fireEvent.click(screen.getByRole('button', { name: `Xem vận hạn năm ${VIEW_YEAR}` }));

    expect(await screen.findByText(/Chưa luận được vận hạn năm 2027/)).toBeTruthy();
  });
});
