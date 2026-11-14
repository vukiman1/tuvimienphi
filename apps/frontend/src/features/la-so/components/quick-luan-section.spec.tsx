import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarType, Gender, type BirthInput } from '@/features/la-so/birth-input';
import { toChartView } from '@/features/la-so/to-chart-view';
import { quickLuanFor } from '@/features/la-so/quick-luan';
import { QuickLuanSection } from './quick-luan-section';

jest.mock('@/features/la-so/quick-luan', () => ({ quickLuanFor: jest.fn() }));

const BIRTH: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};
const CHART = toChartView({ ...BIRTH, viewYear: 2026 });
const quickLuanForMock = jest.mocked(quickLuanFor);

function renderSection(): void {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <QuickLuanSection birth={BIRTH} chart={CHART} cung="Mệnh" onReadChapter={() => undefined} />
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
