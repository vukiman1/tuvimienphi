import { act, render, screen } from '@testing-library/react';
import { LuanGiaiSkeletonCard } from './luan-giai-skeleton';

function tienThoiGian(giay: number): void {
  act(() => jest.advanceTimersByTime(giay * 1_000));
}

function tienDo(): number {
  return Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'));
}

describe('LuanGiaiSkeletonCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('im lặng khi chỉ đang đọc bài đã có, vì việc đó xong trong tích tắc', () => {
    render(<LuanGiaiSkeletonCard />);

    expect(screen.queryByText(/Đang viết/)).toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('nói rõ là đang viết và mất khoảng bao lâu', () => {
    render(<LuanGiaiSkeletonCard isWriting />);

    expect(screen.getByText(/Đang viết luận giải/)).toBeTruthy();
    expect(screen.getByText(/10–20 giây/)).toBeTruthy();
  });

  it('chạy tiến trình theo thời gian chờ', () => {
    render(<LuanGiaiSkeletonCard isWriting />);
    const batDau = tienDo();

    tienThoiGian(5);

    expect(tienDo()).toBeGreaterThan(batDau);
  });

  it('không bao giờ chạm 100%, vì máy chủ không báo tiến độ thật', () => {
    render(<LuanGiaiSkeletonCard isWriting />);

    tienThoiGian(600);

    expect(tienDo()).toBeLessThanOrEqual(90);
  });

  it('chỉ đếm giây khi chờ đã lâu, để lần sinh nhanh không bị nhắc tới thời gian', () => {
    render(<LuanGiaiSkeletonCard isWriting />);

    tienThoiGian(5);
    expect(screen.queryByText(/giây rồi/)).toBeNull();

    tienThoiGian(7);
    expect(screen.getByText(/12 giây rồi/)).toBeTruthy();
  });
});
