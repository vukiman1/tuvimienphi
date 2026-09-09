import { act, render, screen } from '@testing-library/react';
import { LuanGiaiSkeletonCard } from './luan-giai-skeleton';

const BUOC = ['Bước một', 'Bước hai', 'Bước ba'] as const;

describe('LuanGiaiSkeletonCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('không kể bước nào khi chỉ đang đọc bài đã có', () => {
    render(<LuanGiaiSkeletonCard />);

    expect(screen.queryByText(/Bước/)).toBeNull();
  });

  it('đi lần lượt qua từng bước trong lúc chờ', () => {
    render(<LuanGiaiSkeletonCard steps={BUOC} />);
    expect(screen.getByText('Bước một')).toBeTruthy();

    act(() => jest.advanceTimersByTime(1_200));
    expect(screen.getByText('Bước hai')).toBeTruthy();
  });

  it('dừng ở bước cuối chứ không quay vòng về đầu', () => {
    render(<LuanGiaiSkeletonCard steps={BUOC} />);

    act(() => jest.advanceTimersByTime(1_200 * 10));

    expect(screen.getByText('Bước ba')).toBeTruthy();
    expect(screen.queryByText('Bước một')).toBeNull();
  });
});
