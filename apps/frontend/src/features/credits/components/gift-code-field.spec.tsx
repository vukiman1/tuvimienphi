import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-error';
import { httpRequest } from '@/lib/http-request';
import { GiftCodeField } from './gift-code-field';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(), post: jest.fn() },
}));

const HTTP_BAD_REQUEST = 400;

function rejection(message: string): ApiError {
  return new ApiError({
    statusCode: HTTP_BAD_REQUEST,
    success: false,
    errors: { message },
  } as never);
}

function renderField(onRedeemed: jest.Mock = jest.fn()): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <GiftCodeField onRedeemed={onRedeemed} />
    </QueryClientProvider>,
  );
  return queryClient;
}

describe('GiftCodeField', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps the apply button disabled while the input is blank', () => {
    renderField();

    const button = screen.getByRole('button', { name: 'Áp dụng' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    expect(button.disabled).toBe(true);
  });

  it('redeems the typed code and reports the granted lượt', async () => {
    const response = { creditsGranted: 5, chapterCredits: 7 };
    jest.mocked(httpRequest.post).mockResolvedValue(response as never);
    const onRedeemed = jest.fn();
    const queryClient = renderField(onRedeemed);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'WELCOME5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));

    await waitFor(() => expect(onRedeemed).toHaveBeenCalledWith(response));
    expect(httpRequest.post).toHaveBeenCalledWith('/credits/gift-code', { code: 'WELCOME5' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['credits', 'summary'] });
  });

  it("shows the backend's reason when the code is rejected", async () => {
    jest.mocked(httpRequest.post).mockRejectedValue(rejection('Mã quà tặng đã hết hạn.'));
    const onRedeemed = jest.fn();
    renderField(onRedeemed);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'OLDCODE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(await screen.findByText('Mã quà tặng đã hết hạn.')).toBeTruthy();
    expect(onRedeemed).not.toHaveBeenCalled();
  });
});
