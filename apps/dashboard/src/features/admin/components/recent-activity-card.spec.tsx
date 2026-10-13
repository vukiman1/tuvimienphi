import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ActivityList } from './recent-activity-card';

const ROW = {
  id: 'activity-1',
  occurredAt: new Date().toISOString(),
  event: 'auth.login.succeeded',
  userId: 'user-1',
  actorEmail: 'kim@example.com',
  actorName: 'Kim An',
};

describe('ActivityList', () => {
  it('invites the reader to come back rather than showing an empty box', () => {
    render(<ActivityList rows={[]} isPending={false} />);

    expect(screen.getByText('Chưa có hoạt động nào được ghi lại.')).toBeTruthy();
  });

  it('says who did what', () => {
    render(<ActivityList rows={[ROW]} isPending={false} />);

    expect(screen.getByText(/Kim An/)).toBeTruthy();
    expect(screen.getByText(/đã đăng nhập/)).toBeTruthy();
  });

  it('falls back to the email when the account is gone', () => {
    render(<ActivityList rows={[{ ...ROW, userId: null, actorName: null }]} isPending={false} />);

    expect(screen.getByText(/kim@example.com/)).toBeTruthy();
  });

  it('names an unknown actor instead of leaving the line half written', () => {
    render(
      <ActivityList
        rows={[{ ...ROW, userId: null, actorName: null, actorEmail: null }]}
        isPending={false}
      />,
    );

    expect(screen.getByText(/Không rõ/)).toBeTruthy();
  });

  it('says nothing about pages while a single page holds everything', () => {
    render(<ActivityList rows={[ROW]} isPending={false} page={1} total={1} />);

    expect(screen.queryByTitle('2')).toBeNull();
  });

  it('offers the later pages once there is more than one', () => {
    render(<ActivityList rows={[ROW]} isPending={false} page={1} total={45} />);

    expect(screen.getByTitle('3')).toBeTruthy();
  });

  it('asks for the page the reader clicked', () => {
    const onPageChange = vi.fn();
    render(
      <ActivityList
        rows={[ROW]}
        isPending={false}
        page={1}
        total={45}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByTitle('2'));

    expect(onPageChange).toHaveBeenCalledWith(2, expect.anything());
  });

  it('keeps showing the rows it was given rather than slicing them away on a later page', () => {
    render(<ActivityList rows={[ROW]} isPending={false} page={3} total={45} />);

    expect(screen.getByText(/Kim An/)).toBeTruthy();
  });
});
