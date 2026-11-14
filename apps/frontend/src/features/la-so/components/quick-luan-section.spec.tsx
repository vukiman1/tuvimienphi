import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { quickLuanFor } from '@/features/la-so/quick-luan';
import { SAMPLE_BIRTH, SAMPLE_CHART } from '@/test-utils/sample-chart';
import { QuickLuanSection } from './quick-luan-section';

jest.mock('@/features/la-so/quick-luan', () => ({ quickLuanFor: jest.fn() }));

const quickLuanForMock = jest.mocked(quickLuanFor);

function renderSection(): void {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <QuickLuanSection
        birth={SAMPLE_BIRTH}
        chart={SAMPLE_CHART}
        cung="Mệnh"
        onReadChapter={() => undefined}
      />
    </QueryClientProvider>,
  );
}

describe('QuickLuanSection without a reading', () => {
  it('hides luận nhanh when the reading is empty', async () => {
    quickLuanForMock.mockReturnValue(null);

    renderSection();

    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByText('Luận nhanh')).toBeNull();
    expect(screen.queryByText(/^Đọc luận giải chương/)).toBeNull();
  });

  it('hides luận nhanh when the reading fails to load', async () => {
    quickLuanForMock.mockImplementation(() => {
      throw new Error('tables failed to load');
    });

    renderSection();

    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByText('Luận nhanh')).toBeNull();
    expect(screen.queryByText(/^Đọc luận giải chương/)).toBeNull();
  });
});
